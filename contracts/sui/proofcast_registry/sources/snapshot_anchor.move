/// ProofCast registry anchors Walrus-backed snapshot hashes on Sui.
///
/// The full historical memory lives on Walrus. This object stores the minimal
/// durable proof pointer: watched address, blob ID, snapshot hash, checkpoint,
/// previous hash, creator, and creation time.
module proofcast_registry::snapshot_anchor;

use sui::clock::{Self, Clock};
use sui::event;
use sui::object::{Self, ID, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

const E_EMPTY_BLOB: u64 = 0;
const E_EMPTY_HASH: u64 = 1;

public struct SnapshotAnchor has key {
    id: UID,
    creator: address,
    watched_address: address,
    walrus_blob_id: vector<u8>,
    snapshot_hash: vector<u8>,
    checkpoint: u64,
    previous_hash: vector<u8>,
    created_at_ms: u64,
}

public struct SnapshotAnchored has copy, drop {
    anchor_id: ID,
    creator: address,
    watched_address: address,
    checkpoint: u64,
    walrus_blob_id: vector<u8>,
    snapshot_hash: vector<u8>,
    created_at_ms: u64,
}

entry fun create_anchor(
    watched_address: address,
    walrus_blob_id: vector<u8>,
    snapshot_hash: vector<u8>,
    checkpoint: u64,
    previous_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(walrus_blob_id.length() > 0, E_EMPTY_BLOB);
    assert!(snapshot_hash.length() > 0, E_EMPTY_HASH);

    let creator = tx_context::sender(ctx);
    let created_at_ms = clock::timestamp_ms(clock);
    let anchor = SnapshotAnchor {
        id: object::new(ctx),
        creator,
        watched_address,
        walrus_blob_id,
        snapshot_hash,
        checkpoint,
        previous_hash,
        created_at_ms,
    };
    let anchor_id = object::id(&anchor);

    event::emit(SnapshotAnchored {
        anchor_id,
        creator,
        watched_address,
        checkpoint,
        walrus_blob_id: anchor.walrus_blob_id,
        snapshot_hash: anchor.snapshot_hash,
        created_at_ms,
    });

    transfer::transfer(anchor, creator);
}

public fun creator(anchor: &SnapshotAnchor): address {
    anchor.creator
}

public fun watched_address(anchor: &SnapshotAnchor): address {
    anchor.watched_address
}

public fun checkpoint(anchor: &SnapshotAnchor): u64 {
    anchor.checkpoint
}

public fun created_at_ms(anchor: &SnapshotAnchor): u64 {
    anchor.created_at_ms
}

public fun walrus_blob_id(anchor: &SnapshotAnchor): vector<u8> {
    anchor.walrus_blob_id
}

public fun snapshot_hash(anchor: &SnapshotAnchor): vector<u8> {
    anchor.snapshot_hash
}

public fun previous_hash(anchor: &SnapshotAnchor): vector<u8> {
    anchor.previous_hash
}
