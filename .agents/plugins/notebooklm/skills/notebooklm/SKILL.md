---
name: notebooklm
description: >-
  Use when interacting with Google NotebookLM to list notebooks, create notebooks,
  upload/manage sources, query grounded information, and generate study artifacts.
---

# Google NotebookLM MCP Integration

This skill guides interaction with Google NotebookLM via the `notebooklm-mcp` server.

## Overview
NotebookLM allows interacting with documents, grounded notes, and AI synthesis.

## Authentication Setup (First Time Use)
To authenticate the MCP server with your Google account:
1. Run in your terminal:
   ```bash
   npx -y notebooklm-mcp setup_auth
   ```
2. A browser window will open. Complete the login with your Google account.
3. Once authenticated, close the browser. The session cookies will be stored persistently.

## Capabilities & Available Tools
Once authenticated, the following operations are available through MCP tools:
- **List Notebooks**: List all existing notebooks in the user's account.
- **Create Notebook**: Create a new notebook with a title and optional description.
- **Add Sources**: Ingest URLs, text, or file documents as sources.
- **Query / Ask Notebook**: Ask questions grounded strictly in the notebook's sources.
- **Generate Artifacts**: Generate summaries, study guides, outlines, FAQs, and briefing docs.
