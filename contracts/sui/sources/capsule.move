/// MemoraVault time capsules.
///
/// Walrus stores encrypted content and metadata. This Sui object stores ownership,
/// immutable proof references, and unlock conditions. Plaintext never appears on-chain.
module memoravault::capsule;

use sui::clock::{Self, Clock};
use sui::event;
use sui::object::{Self, ID, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

const E_NOT_OWNER: u64 = 0;
const E_NOT_AUTHORIZED: u64 = 1;
const E_NO_BLOBS: u64 = 2;
const E_UNLOCK_IN_PAST: u64 = 3;
const E_LOCKED: u64 = 4;
const E_ALREADY_UNLOCKED: u64 = 5;
const E_DELETED: u64 = 6;
const E_INVALID_VISIBILITY: u64 = 7;
const E_EMPTY_METADATA: u64 = 8;
const E_EMPTY_HASH: u64 = 9;
const E_INVALID_RECIPIENT: u64 = 10;

const VISIBILITY_PRIVATE: u8 = 0;
const VISIBILITY_SHARED: u8 = 1;
const VISIBILITY_PUBLIC: u8 = 2;

public struct Capsule has key {
    id: UID,
    owner: address,
    blob_ids: vector<vector<u8>>,
    metadata_blob_id: vector<u8>,
    created_at_ms: u64,
    unlock_time_ms: u64,
    visibility: u8,
    shared_with: vector<address>,
    ai_summary_blob_id: vector<u8>,
    content_hash: vector<u8>,
    unlocked: bool,
    deleted: bool,
}

public struct CapsuleCreated has copy, drop {
    capsule_id: ID,
    owner: address,
    created_at_ms: u64,
    unlock_time_ms: u64,
    metadata_blob_id: vector<u8>,
}

public struct CapsuleUnlocked has copy, drop {
    capsule_id: ID,
    owner: address,
    unlocked_at_ms: u64,
}

public struct CapsuleShared has copy, drop {
    capsule_id: ID,
    owner: address,
    recipient: address,
}

public struct CapsuleUpdated has copy, drop {
    capsule_id: ID,
    owner: address,
    updated_at_ms: u64,
    unlock_time_ms: u64,
}

public struct CapsuleDeleted has copy, drop {
    capsule_id: ID,
    owner: address,
    deleted_at_ms: u64,
}

entry fun create_capsule(
    blob_ids: vector<vector<u8>>,
    metadata_blob_id: vector<u8>,
    unlock_time_ms: u64,
    visibility: u8,
    ai_summary_blob_id: vector<u8>,
    content_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(blob_ids.length() > 0, E_NO_BLOBS);
    assert!(metadata_blob_id.length() > 0, E_EMPTY_METADATA);
    assert!(content_hash.length() > 0, E_EMPTY_HASH);
    assert!(is_valid_visibility(visibility), E_INVALID_VISIBILITY);

    let owner = tx_context::sender(ctx);
    let created_at_ms = clock::timestamp_ms(clock);

    assert!(unlock_time_ms > created_at_ms, E_UNLOCK_IN_PAST);

    let capsule = Capsule {
        id: object::new(ctx),
        owner,
        blob_ids,
        metadata_blob_id,
        created_at_ms,
        unlock_time_ms,
        visibility,
        shared_with: vector[],
        ai_summary_blob_id,
        content_hash,
        unlocked: false,
        deleted: false,
    };
    let capsule_id = object::id(&capsule);

    event::emit(CapsuleCreated {
        capsule_id,
        owner,
        created_at_ms,
        unlock_time_ms,
        metadata_blob_id: capsule.metadata_blob_id,
    });

    transfer::transfer(capsule, owner);
}

entry fun unlock_capsule(capsule: &mut Capsule, clock: &Clock, ctx: &TxContext) {
    assert_not_deleted(capsule);
    assert!(is_authorized(capsule, tx_context::sender(ctx)), E_NOT_AUTHORIZED);
    assert!(!capsule.unlocked, E_ALREADY_UNLOCKED);

    let unlocked_at_ms = clock::timestamp_ms(clock);
    assert!(unlocked_at_ms >= capsule.unlock_time_ms, E_LOCKED);

    capsule.unlocked = true;

    event::emit(CapsuleUnlocked {
        capsule_id: object::id(capsule),
        owner: capsule.owner,
        unlocked_at_ms,
    });
}

entry fun share_capsule(capsule: &mut Capsule, recipient: address, ctx: &TxContext) {
    assert_owner(capsule, tx_context::sender(ctx));
    assert_not_deleted(capsule);
    assert!(recipient != @0x0, E_INVALID_RECIPIENT);

    if (!contains_address(&capsule.shared_with, recipient)) {
        capsule.shared_with.push_back(recipient);
    };

    event::emit(CapsuleShared {
        capsule_id: object::id(capsule),
        owner: capsule.owner,
        recipient,
    });
}

entry fun update_capsule(
    capsule: &mut Capsule,
    blob_ids: vector<vector<u8>>,
    metadata_blob_id: vector<u8>,
    unlock_time_ms: u64,
    visibility: u8,
    ai_summary_blob_id: vector<u8>,
    content_hash: vector<u8>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert_owner(capsule, tx_context::sender(ctx));
    assert_not_deleted(capsule);
    assert!(!capsule.unlocked, E_ALREADY_UNLOCKED);
    assert!(blob_ids.length() > 0, E_NO_BLOBS);
    assert!(metadata_blob_id.length() > 0, E_EMPTY_METADATA);
    assert!(content_hash.length() > 0, E_EMPTY_HASH);
    assert!(is_valid_visibility(visibility), E_INVALID_VISIBILITY);

    let updated_at_ms = clock::timestamp_ms(clock);
    assert!(unlock_time_ms > updated_at_ms, E_UNLOCK_IN_PAST);

    capsule.blob_ids = blob_ids;
    capsule.metadata_blob_id = metadata_blob_id;
    capsule.unlock_time_ms = unlock_time_ms;
    capsule.visibility = visibility;
    capsule.ai_summary_blob_id = ai_summary_blob_id;
    capsule.content_hash = content_hash;

    event::emit(CapsuleUpdated {
        capsule_id: object::id(capsule),
        owner: capsule.owner,
        updated_at_ms,
        unlock_time_ms,
    });
}

entry fun delete_capsule(capsule: &mut Capsule, clock: &Clock, ctx: &TxContext) {
    assert_owner(capsule, tx_context::sender(ctx));
    assert_not_deleted(capsule);

    capsule.deleted = true;
    let deleted_at_ms = clock::timestamp_ms(clock);

    event::emit(CapsuleDeleted {
        capsule_id: object::id(capsule),
        owner: capsule.owner,
        deleted_at_ms,
    });
}

public fun verify_unlock(capsule: &Capsule, clock: &Clock): bool {
    !capsule.deleted && clock::timestamp_ms(clock) >= capsule.unlock_time_ms
}

public fun owner(capsule: &Capsule): address {
    capsule.owner
}

public fun created_at_ms(capsule: &Capsule): u64 {
    capsule.created_at_ms
}

public fun unlock_time_ms(capsule: &Capsule): u64 {
    capsule.unlock_time_ms
}

public fun visibility(capsule: &Capsule): u8 {
    capsule.visibility
}

public fun unlocked(capsule: &Capsule): bool {
    capsule.unlocked
}

public fun deleted(capsule: &Capsule): bool {
    capsule.deleted
}

fun assert_owner(capsule: &Capsule, sender: address) {
    assert!(capsule.owner == sender, E_NOT_OWNER);
}

fun assert_not_deleted(capsule: &Capsule) {
    assert!(!capsule.deleted, E_DELETED);
}

fun is_authorized(capsule: &Capsule, sender: address): bool {
    capsule.owner == sender
        || capsule.visibility == VISIBILITY_PUBLIC
        || contains_address(&capsule.shared_with, sender)
}

fun is_valid_visibility(visibility: u8): bool {
    visibility == VISIBILITY_PRIVATE
        || visibility == VISIBILITY_SHARED
        || visibility == VISIBILITY_PUBLIC
}

fun contains_address(values: &vector<address>, value: address): bool {
    let mut index = 0;
    let length = values.length();

    while (index < length) {
        if (*values.borrow(index) == value) {
            return true
        };
        index = index + 1;
    };

    false
}
