# ProofCast Registry

This Sui Move package anchors ProofCast snapshot proofs.

Walrus stores the full canonical memory artifact. The registry object stores only:

- watched Sui address
- Walrus blob ID
- canonical snapshot hash
- checkpoint
- previous snapshot hash
- creator
- creation timestamp from Sui `Clock`

Build:

```bash
sui move build --path contracts/sui/proofcast_registry
```

Publish the package to Sui testnet, then set:

```bash
SUI_PROOFCAST_PACKAGE_ID="0x..."
```
