# ProofCast Architecture

ProofCast has four engines:

- Snapshot Engine: captures live Sui state from Tatum and builds canonical snapshot JSON.
- Verification Engine: compares Walrus blob content, canonical hashes, Tatum data, and optional Sui anchors.
- Replay Engine: reconstructs wallet state over time from stored snapshots.
- Timeline Engine: renders historical playback and public proof surfaces.

The system fails closed. Missing infrastructure returns setup blockers instead of demo data.
