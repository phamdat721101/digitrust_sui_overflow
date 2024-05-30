module digitrust::dgt_social {
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::dynamic_object_field as dof;
    use sui::coin::{Self, Coin};
    use sui::sui::{SUI};
    use sui::event;
    use sui::clock::{Self, Clock};

    use std::string::{Self, String};
    use std::vector::{Self};
    
    
    //errors
    const EUsernameTaken: u64 = 1;
    const EUnauthorized: u64 = 2;
    const ESubscriptionExist: u64 = 3;
    const ESubscriptionNotExist: u64 = 4;
    const EInsufficientFlowRate:u64 = 5;

    struct VaultManager has key, store {
        id: UID,
        isPublished: VecSet<String>,
        portfolio: Table<address, Table<String, Portfolio>>,
        investors: Table<u128, Investor>,
    }

    struct Investor has store{
        wallet: address,
        amount: u64,
    }

    struct Vault has store, drop {
        id: u64,
        owner: address,
        isManager: bool,
        investor: address,
    }

    struct Portfolio has store,drop {
        startedAt: u64,
        endAt: u64,
        asset: String,
        risk: String,
        chain: String,
        pool: address,
        protocol: address
    }

    
    struct OwnerCap has key,store {
        id: UID
    }

    // witness
    struct DGT_SOCIAL has drop {

    }

    //Event 
    struct EventVaultCreated has copy,drop {
        vaultId: ID,
    }

    struct EventVaultCopied has copy,drop {
        vaultId: u64,
    }

    struct EventFollowed has copy, drop {
        from: String,
        to: String,
    }

    struct EventCommentAdded has copy, drop {
        topic: String,
        position: u64,
    }

    struct EventSubscribed has copy, drop {
        from: address,
        toAddress: address,
        flowRate: u128,
    }

    struct EventLivestreamInfoUpdated has copy, drop {
        creator: address,
        newTitle: String,
    }

    struct EventSubscriptionChargeUpdated has copy, drop {
        creator: address,
        newFlowRate: u128,
    }

    struct PortfolioStructure has copy, drop{
        manager: address, 
        amount: u128, 
        asset:vector<String>
    }


    // constructor
    fun init(_: DGT_SOCIAL, ctx:&mut TxContext) {
        // transfer OwnerCap to the contrac of owner
        transfer::transfer(OwnerCap{
            id: object::new(ctx),
        }, tx_context::sender(ctx));

        transfer::share_object(VaultManager{
            id: object::new(ctx),
            isPublished: vec_set::empty(),
            portfolio: table::new(ctx),
            investors: table::new(ctx),
        });
    }

    // Vault Function
    public entry fun copyVault(copyId: u64, owner: address, ctx:&mut TxContext) {
        let sender = tx_context::sender(ctx);
        let vault = Vault{
            id: copyId,
            owner: owner,
            isManager: true,
            investor: sender,
        };

        event::emit(EventVaultCopied{
            vaultId: copyId,
        });
    }

    // public entry fun createVault(vaultManager: &mut VaultManager, ctx:&mut TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let vault = Vault{
    //         id: object::new(ctx),
    //         isManager: true,
    //         owner: sender,
    //     };

    //     let vaultId = object::id(&vault);
        
    //     // dof::add(&mut Function.id, profileId, profile);
    //     // table::add(&mut vaultManager.portfolio, sender, username);
    //     table::add(&mut vaultManager.investors, 24, sender, 0);

    //     event::emit(EventVaultCreated{
    //         vaultId: vaultId,
    //     });
    // }

    // public entry fun tip(receiver: address, amount: Coin<SUI>, ctx: &TxContext) {

    //     event::emit(EventTipped{
    //         sender: tx_context::sender(ctx),
    //         receiver: receiver,
    //         amount: coin::value(&amount),
    //     });
    //     transfer::public_transfer(amount, receiver);
    // }

    // public entry fun follow(datahouse:&mut DataHouse, to: String, ctx:&TxContext) {
    //     let from = table::borrow(&datahouse.addressToUsername, tx_context::sender(ctx));
    //     let fromProfileId = table::borrow(&datahouse.usernameToProfile, *from);
    //     let fromProfile = dof::borrow_mut<ID, Vault>(&mut datahouse.id, *fromProfileId);
    //     vector::push_back(&mut fromProfile.follows, to);

    //     let toProfileId = table::borrow(&datahouse.usernameToProfile, to);
    //     let toProfile = dof::borrow_mut<ID, Vault>(&mut datahouse.id, *toProfileId);
    //     vector::push_back(&mut toProfile.followers, *from);

    //     event::emit(EventFollowed{
    //         from: *from,
    //         to: to,
    //     });
    // }

    // public entry fun setStreamInfo(datahouse: &mut DataHouse,title: String, thumbnail:String, ctx:&TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let senderUsername = table::borrow(&datahouse.addressToUsername, sender);
    //     let profileId = table::borrow(&datahouse.usernameToProfile, *senderUsername);
    //     let profile = dof::borrow_mut<ID, Vault>(&mut datahouse.id, *profileId);

    //     event::emit(EventLivestreamInfoUpdated{
    //         creator: sender,
    //         newTitle: title,
    //     });
    // }

    // public entry fun setSubscriptionCharge(datahouse: &mut DataHouse, flowRate: u128, ctx:&TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let senderUsername = table::borrow(&datahouse.addressToUsername, sender);
    //     let profileId = table::borrow(&datahouse.usernameToProfile, *senderUsername);
    //     let profile = dof::borrow_mut<ID, Vault>(&mut datahouse.id, *profileId);

    //     event::emit(EventSubscriptionChargeUpdated{
    //         creator: sender,
    //         newFlowRate: flowRate,
    //     });
    // }

    // /// Session Functions
    // public entry fun addStream(datahouse: &mut DataHouse, streamNftId:u128, sessionId: String, isSubscribersOnly: bool, ctx:&TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let creator = table::borrow(&datahouse.addressToUsername, sender);
    //     let stream = Stream{
    //         id: streamNftId,
    //         creator: *creator,
    //         sessionId: sessionId,
    //         views: 0,
    //         isSubscribersOnly: false,
    //     };
    //     table::add(&mut datahouse.streams, streamNftId, stream);
    //     vec_set::insert(&mut datahouse.isPublished, sessionId);

    //     event::emit(EventStreamPublished{
    //         streamNftId: streamNftId,
    //         creator: sender,
    //     });
    // }

    // public entry fun sessionViewIncrement(datahouse: &mut DataHouse, streamNftId:u128, ctx:&TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let stream = table::borrow_mut(&mut datahouse.streams, streamNftId);
    //     if (stream.isSubscribersOnly == true) {
    //         let subscriptionsTable = table::borrow_mut<address,  Table<String, Subscription>>(&mut datahouse.subscriptions, sender);
    //         assert!(table::contains(subscriptionsTable, stream.creator)==true, 0);
    //     };
    //     stream.views = stream.views + 1;

    //     event::emit(EventVideoViewed{
    //         id: streamNftId,
    //         viewer: sender,
    //     });
    // }

    // public entry fun toggleSubOnlyForPublishedStream(datahouse: &mut DataHouse, streamNftId:u128, ctx:&TxContext){
    //     let sender = tx_context::sender(ctx);
    //     let senderUsername = table::borrow(&datahouse.addressToUsername, sender);
    //     let stream = table::borrow_mut(&mut datahouse.streams, streamNftId);
    //     assert!(stream.creator == *senderUsername, EUnauthorized);
    //     if (stream.isSubscribersOnly == true) {
    //         stream.isSubscribersOnly = false;
    //     } else {
    //         stream.isSubscribersOnly = true;
    //     }
    // }

    // /// Comments Function
    // public entry fun addComment(topic:String, message:String, datahouse: &mut DataHouse, clock: &Clock, ctx:&TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     let comments = table::borrow_mut(&mut datahouse.commentsByTopic, topic);
    //     let comment = Comment {
    //         topic: topic,
    //         message: message,
    //         senderAddress: sender,
    //         senderUsername: *(table::borrow(&datahouse.addressToUsername, sender)),
    //         createdAt: clock::timestamp_ms(clock),
    //     };
    //     vector::push_back(comments, comment);

    //     event::emit(EventCommentAdded{
    //         topic: topic,
    //         position: vector::length(comments),
    //     });
    // }

    // public entry fun subscribe(toUsername:String, flowRate:u128, datahouse: &mut DataHouse, clock: &Clock, ctx:&mut TxContext) {
    //     let sender = tx_context::sender(ctx);
    //     if (table::contains(&datahouse.subscriptions, sender) == false) {
    //         table::add(&mut datahouse.subscriptions, sender, table::new(ctx));
    //     };
    //     {
    //         let subscriptionsTable = table::borrow_mut<address,  Table<String, Subscription>>(&mut datahouse.subscriptions, sender);
    //         assert!(table::contains(subscriptionsTable, toUsername)==false, ESubscriptionExist);
    //     };

    //     let toProfileId = table::borrow(&datahouse.usernameToProfile, toUsername);
    //     let toProfile = dof::borrow_mut<ID, Vault>(&mut datahouse.id, *toProfileId);

    //     let subscription = Subscription{
    //         startedAt: clock::timestamp_ms(clock),
    //         flowRate: flowRate,
    //         toUsername: toUsername,
    //         toAddress: toProfile.owner,
    //         fromAddress: sender,
    //     };
       
    //     let senderSubscriptions = table::borrow_mut(&mut datahouse.subscriptions, sender);
    //     table::add(senderSubscriptions, toUsername, subscription);

    //     event::emit(EventSubscribed{
    //         from: sender,
    //         toAddress: toProfile.owner,
    //         flowRate: flowRate,
    //     });
    // }

    // public entry fun unsubscribe(toUsername:String, datahouse: &mut DataHouse, ctx: &TxContext){
    //    let sender = tx_context::sender(ctx);
    //    assert!(table::contains(&datahouse.subscriptions, sender)==true, ESubscriptionNotExist);
    //    {
    //         let subscriptionsTable = table::borrow_mut<address,  Table<String, Subscription>>(&mut datahouse.subscriptions, sender);
    //         assert!(table::contains(subscriptionsTable, toUsername)==true, ESubscriptionNotExist);
    //     };
    //    let senderSubscriptions = table::borrow_mut(&mut datahouse.subscriptions, sender);
    //    table::remove(senderSubscriptions, toUsername);

    //    event::emit(EventUnsubscribed{
    //         subscriber: sender,
    //         creator: toUsername,
    //    });
    // }
}