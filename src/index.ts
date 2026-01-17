#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  scanSkillsDirectory,
  filenameToToolName,
  toolNameToFilename,
  readSkillFile,
  getSkillDescription,
  readSkillResourcesIndex,
  scanAllResources,
  readResourceByUri,
} from './utils.js';

class SkillsHubServer {
  private server: Server;

  constructor() {
    // Note: Server class is marked as deprecated in the SDK, but it's still required
    // for dynamic tool registration via setRequestHandler. McpServer doesn't support
    // this pattern for dynamically loaded tools from the filesystem.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Server is deprecated but required for dynamic tool registration
    this.server = new Server(
      {
        name: 'ai-skills-hub',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // Handle list_tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const skillFiles = await scanSkillsDirectory();
      const tools = [];

      for (const filename of skillFiles) {
        try {
          const content = await readSkillFile(filename);
          const description = getSkillDescription(content, filename);
          const toolName = filenameToToolName(filename);

          tools.push({
            name: toolName,
            description: description,
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          });
        } catch (error) {
          console.error(`Error processing skill file ${filename}:`, error);
        }
      }

      return { tools };
    });

    // Handle call_tool request
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params;

      // Convert tool name to filename (use async version to correctly match filename)
      const filename = await toolNameToFilename(name);
      if (!filename) {
        throw new Error(`Invalid tool name: ${name}`);
      }

      try {
        // Read corresponding Markdown file content
        const content = await readSkillFile(filename);
        
        // Read resources directory index information (only includes filename and description, not full content)
        const resourcesIndex = await readSkillResourcesIndex(filename);
        
        // Combine content: first SKILL.md, then resources index
        let combinedContent = content;
        
        // If there are resource files, add index list (without full content to save tokens)
        if (resourcesIndex.length > 0) {
          combinedContent += '\n\n---\n\n## Available Resources\n\n';
          combinedContent += 'The following resource files are available for this skill. ';
          combinedContent += 'Each resource provides detailed guidance on specific topics.\n\n';
          
          // Add index information for each resource after sorting by filename
          for (const resource of resourcesIndex) {
            const resourceName = resource.filename.replace(/\.md$/, '');
            combinedContent += `- **${resourceName}**: ${resource.description}\n`;
          }
          
          combinedContent += '\n';
        }
        
        return {
          content: [
            {
              type: 'text' as const,
              text: combinedContent,
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Failed to read skill file: ${filename}. ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // Handle resources/list request - list all available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const allResources = await scanAllResources();
        
        const resources = allResources.map(resource => ({
          uri: resource.uri,
          name: resource.uri.replace(/^skill:\/\//, '').replace(/\.md$/, ''),
          description: resource.description,
          mimeType: 'text/markdown',
        }));
        
        return { resources };
      } catch (error) {
        console.error('Error listing resources:', error);
        return { resources: [] };
      }
    });

    // Handle resources/read request - read specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (!uri) {
        throw new Error('Resource URI is required');
      }
      
      try {
        const content = await readResourceByUri(uri);
        
        return {
          contents: [
            {
              type: 'text' as const,
              text: content,
              mimeType: 'text/markdown',
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Failed to read resource: ${uri}. ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error: Error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Skills Hub MCP server running on stdio');
  }
}

// Start server
const server = new SkillsHubServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
