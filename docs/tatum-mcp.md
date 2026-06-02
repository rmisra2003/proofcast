# Tatum MCP Integration

ProofCast uses **Tatum MCP only** for MCP positioning. We do not ship a custom
ProofCast MCP server.

## Role in the project

- Tatum MCP: AI assistants can inspect blockchain facts through Tatum's official MCP server.
- ProofCast web app: captures a Sui address, stores the memory on Walrus, generates AI reports,
  and verifies the proof.
- Walrus: permanent storage layer for the saved memory artifacts.

## MCP client config

Use the official Tatum Blockchain MCP package:

```json
{
  "mcpServers": {
    "tatumio": {
      "command": "npx",
      "args": ["@tatumio/blockchain-mcp"],
      "env": {
        "TATUM_API_KEY": "YOUR_TATUM_API_KEY"
      }
    }
  }
}
```

Keep the real API key in the MCP client environment. Do not expose it in
frontend code.

## Judge demo prompts

```text
Use Tatum MCP to inspect this Sui wallet. What changed recently?
```

```text
Use Tatum MCP RPC tools to confirm whether these transaction digests exist.
```

```text
After I create a ProofCast, use Tatum MCP to independently inspect the same wallet history.
```

## Demo story

1. Open an MCP-enabled assistant configured with Tatum MCP.
2. Ask it to inspect the hackathon Sui wallet.
3. Open ProofCast and capture the same wallet.
4. Show the Walrus blob, AI explanation, public proof, and replay mode.
5. Explain that Tatum MCP is the agent-facing blockchain intelligence path, while ProofCast is the
   human-facing permanent memory product.
