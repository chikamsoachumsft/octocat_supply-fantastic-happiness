---
mode: 'agent'
model: Claude Sonnet 4
tools: ['edit', 'codebase', 'search']
description: 'Generate comprehensive documentation for MCP server tools and APIs'
---

Your goal is to generate comprehensive documentation for the MCP server.

Analyze the current codebase to understand:
* Available MCP tools and their functionality
* Tool parameters, types, and validation rules
* Response formats and data structures
* Error conditions and handling
* Configuration options and setup requirements

Documentation requirements following [documentation guidelines](../instructions/documentation.instructions.md):

**API Documentation:**
* Document all MCP tools with clear descriptions
* Include parameter specifications with types and constraints
* Provide request/response examples for each tool
* Document error codes and error response formats
* Include authentication requirements if applicable

**Tool Reference:**
* Tool name and purpose description
* Parameter details with Zod schema information
* Usage examples with realistic scenarios
* Expected response structure and data types
* Common error conditions and solutions

**Setup and Configuration:**
* Installation instructions and requirements
* Environment setup and dependencies
* Configuration file options and formats
* Server startup and connection procedures
* Troubleshooting guide for common issues

**Integration Guide:**
* How to connect MCP clients to the server
* Protocol communication patterns
* Authentication and security considerations
* Performance recommendations
* Best practices for tool usage

**Code Documentation:**
* JSDoc comments for all public interfaces
* Inline comments for complex algorithms
* Type definitions and interface documentation
* Module organization and architecture overview
* Development workflow and contribution guidelines

**User Guide Sections:**
* Quick start tutorial
* Common use cases and examples
* Advanced configuration options
* Integration with popular MCP clients
* FAQ and troubleshooting section

**Developer Documentation:**
* Architecture overview and design decisions
* Adding new tools and extending functionality
* Testing strategies and test execution
* Deployment and production considerations
* Contributing guidelines and code standards

**Examples and Tutorials:**
* Step-by-step setup walkthrough
* Common file operations examples
* Error handling demonstrations
* Integration code samples
* Best practices implementation

Documentation format:
* Use clear, concise language
* Include code examples with syntax highlighting
* Provide realistic, working examples
* Use consistent formatting and structure
* Include cross-references between sections

Update existing documentation:
* README.md with current feature set
* API reference with latest tool specifications
* Configuration examples with current options
* Troubleshooting with known issues and solutions
* Changelog with version history and changes

Ensure documentation is:
* Accurate and up-to-date with current code
* Complete for all public APIs and tools
* Accessible to both beginners and advanced users
* Well-organized with clear navigation
* Regularly maintainable and version-controlled