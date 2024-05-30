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

    struct EventSubscribed has copy, drop {
        manager: address,
        investor: address,
        amount: u128,
    }

    struct EventSubscriptionChargeUpdated has copy, drop {
        investor: address,
        amount: u128,
    }

    struct EventUnsubscribed has copy, drop{
        manager: address, 
        package_type: vector<String>
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

    public entry fun createVault(vaultManager: &mut VaultManager, ctx:&mut TxContext) {
        let sender = tx_context::sender(ctx);
        let vault = Vault{
            id: object::new(ctx),
            isManager: true,
            owner: sender,
        };

        let vaultId = object::id(&vault);
        
        // dof::add(&mut Function.id, profileId, profile);
        // table::add(&mut vaultManager.portfolio, sender, username);
        table::add(&mut vaultManager.investors, 24, sender, 0);

        event::emit(EventVaultCreated{
            vaultId: vaultId,
        });
    }

    public entry fun follow(vaultManager:&mut VaultManager, to: String, ctx:&TxContext) {
        let from = table::borrow(&vaultManager.addressToUsername, tx_context::sender(ctx));
        let fromProfileId = table::borrow(&vaultManager.usernameToProfile, *from);
        let fromProfile = dof::borrow_mut<ID, Vault>(&mut vaultManager.id, *fromProfileId);
        vector::push_back(&mut fromProfile.follows, to);

        let toProfileId = table::borrow(&vaultManager.usernameToProfile, to);
        let toProfile = dof::borrow_mut<ID, Vault>(&mut vaultManager.id, *toProfileId);
        vector::push_back(&mut toProfile.followers, *from);

        event::emit(EventFollowed{
            from: *from,
            to: to,
        });
    }

    public entry fun setSubscriptionCharge(vaultManager: &mut VaultManager, amount: u128, ctx:&TxContext) {
        let sender = tx_context::sender(ctx);
        let senderUsername = table::borrow(&vaultManager.addressToUsername, sender);
        let profileId = table::borrow(&vaultManager.usernameToProfile, *senderUsername);
        let profile = dof::borrow_mut<ID, Vault>(&mut vaultManager.id, *profileId);

        event::emit(EventSubscriptionChargeUpdated{
            investor: sender,
            amount: amount,
        });
    }

    public entry fun unsubscribe(package_type:String, vaultManager: &mut VaultManager, ctx: &TxContext){
       let manager = tx_context::sender(ctx);
       assert!(table::contains(&vaultManager.subscriptions, sender)==true, ESubscriptionNotExist);
       {
            let subscriptionsTable = table::borrow_mut<address,  Table<String, Subscription>>(&mut vaultManager.subscriptions, sender);
            assert!(table::contains(subscriptionsTable, toUsername)==true, ESubscriptionNotExist);
        };
       let senderSubscriptions = table::borrow_mut(&mut vaultManager.subscriptions, sender);
       table::remove(senderSubscriptions, package_type);

       event::emit(EventUnsubscribed{
            manager: manager,
            package_type: package_type,
       });
    }
}