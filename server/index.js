const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const user = require('./routes/user.route')
const vault = require('./routes/vault.route')
const investment = require('./routes/investment.route')
const asset = require('./routes/asset.route')

const vault_generator = require('./services/history');

// const adr_sub_event = require('./sui_event')

// adr_sub_event()

// const mongoose = require("mongoose");

// mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://0.0.0.0:27017");

// async function getData() {
//     const url = 'http://localhost:4001/v1/status';
//     const response = await fetch(url);
//     const jsonResponse = await response.json();
//     console.log("PQD: ", jsonResponse);
// } 
  
// app.use(express.static('public'))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: '*'
}));
app.use('/v1', user)
app.use('/v1', vault)
app.use('/v1', investment)
app.use('/v1', asset)

app.get('/', async (req, res) => {
    // let resp = await axios.get('http://109.123.233.65:4001/v1/asset?assetAddress=0x23926749Faf9F9AB807e57010999e9f274390421')

    // console.log("resp after: ", resp.data.data)
    let resp = await vault_generator()
    res.json({
        code: 0,
        data: resp
    })
})

app.get('/asset/detail', async(req, res) =>{
    let assetAdr = req.query.assetAdr
    res.json({
        code: 0,
        data: {
            "owner":"0x59bC75a49B08088C1866fc2fF8E9776C9585ee5F",
            "tokenId": 1306,
            "assetId":"DGT",
            "amount":1200,
            "image":"link",
            "information":"get information from herer"
        }
    })
})

app.get('/assets', async (req, res) => {
    // let request = req.query.assetAddress
    // let resp = await axios.get(`http://109.123.233.65:4001/v1/asset?assetAddress=${request}`)

    res.json({
        status: 200,
        data: [
            {
                "owner":"0x59bC75a49B08088C1866fc2fF8E9776C9585ee5F",
                "assetId":"DGT",
                "tokenId": 12,
                "image":"link",
                "information":"get information from herer"
            },
            {
                "owner":"0x59bC75a49B08088C1866fc2fF8E9776C9585ee5F",
                "assetId":"HOC",
                "tokenId": 15,
                "image":"link",
                "information":"get information from herer"
            },
            {
                "owner":"0x59bC75a49B08088C1866fc2fF8E9776C9585ee5F",
                "assetId":"PQD",
                "tokenId": 18,
                "image":"link",
                "information":"get information from herer"
            }
        ]
    })
})

app.get('/v1/asset', async (req, res) => {
    let request = req.query.assetAddress
    let resp = await axios.get(`http://109.123.233.65:4001/v1/asset?assetAddress=${request}`)

    res.json({
        code: 0,
        data: resp.data.data
    })
})

app.get('/v1/invest', async (req, res) => {
    let request = req.query.orderAdr
    console.log("Req: ", request)
    let resp = await axios.get(`http://109.123.233.65:4001/v1/order?orderAdr=${request}`)

    res.json({
        code: 0,
        data: resp.data.data
    })
})

app.post('/v1/create_invest', async (req, res) =>{
    let resp = await axios.post("http://109.123.233.65:4001/v1/order/createOrder", {
        assetAddress: req.body.assetAddress,
        symbol: req.body.symbol,
        startPrice: req.body.startPrice,
        endPrice:req.body.endPrice,
        openAt: req.body.openAt,
        closeAt: req.body.closeAt,
        amount: req.body.amount,
        duration: req.body.duration,
        owner: req.body.owner
    })
    
    res.json({
        code: 0,
        data: resp.data
    })
})

app.post('/v1/set_price', async (req, res) =>{
    let resp = await axios.post("http://109.123.233.65:4001/v1/order/setPriceOrder", {
        price: req.body.price,
        symbol: req.body.symbol,
        orderContractAddress: req.body.orderContractAddress
    })

    res.json({
        code:0,
        data: resp.data
    })
})

app.post('/v1/confirm_result', async (req, res) =>{
    let resp = await axios.post("http://109.123.233.65:4001/v1/order/confirmResult", {
        symbol: req.body.symbol,
        price: req.body.price,
        orderContractAddress: req.body.orderContractAddress
    })

    res.json({
        code: 0,
        data: resp.data
    })
})

app.post('/v1/withdraw', async (req, res) =>{
    console.log("PQD claim profit")
    let resp = await axios.post("http://109.123.233.65:4001/v1/order/claimProfit", {
        orderAdr: req.body.orderAdr,
        receiver: req.body.receiver
    })

    res.json({
        code: 0,
        data: resp.data
    })
})

app.post('/v1/invest', async (req, res) => {
    let request = {
        assetAdr: req.body.assetAdr,
        investor: req.body.investor,
        amount: req.body.amount,
        data: req.body.data
    }

    res.json({
        code: 0,
        data: "invest success"
    })
})

/*
 get sui transaction history
*/
const get_digest = async(user) =>{
    let resp = await axios.post("https://explorer-rpc.testnet.sui.io/", {
        "jsonrpc":"2.0",
        "id": "19",
        "method":"suix_queryTransactionBlocks",
        "params":[
            {
                "filter":{
                    "ToAddress":user
                },
                "options":{"showEffects":true,"showInput":true}
            },
                null,100,true
            ]
    })
    
    // return response
    console.log("Digest data: ", resp)
    return resp.data
}

const history = async (digest) => {
    // fetch from sui network
    let resp = await axios.post("https://explorer-rpc.testnet.sui.io/", {
        "jsonrpc":"2.0",
        "id":1,
        "method":"sui_getEvents",
        "params":[
            digest
            // {
            //     "Sender":"0x20cc2eb9d2559127da7c3eebd70169d5c95ff7eda490498951d32a3c53c50622"
            // },
            // {
            //     "txDigest":"6xKtWLEizBRy3hoJQZkRWu95H8iJKvakn47MbEQ2hMGJ",
            //     "eventSeq": "0"
            // },
            // 100,
            // false
            // {
            //     "filter":{
            //         "ToAddress":"0x20cc2eb9d2559127da7c3eebd70169d5c95ff7eda490498951d32a3c53c50622",
            //         "Package": "0x7e3cee9f0eb68d0aca0f590411b172593690d6f40c1ef0ca64da9194508d4291"
            //     },
            //     "options":{"showEffects":true,"showInput":true}
            // },
                // null,100,true
            ]
    })
    
    // return response
    return resp.data
};

const evm_history = async (req) =>{
    let resp = await axios.get(`https://api-baobab.klaytnscope.com/v2/accounts/${req}/txs`)
    let transactions = resp.data.result
    let listTx = []
    let tx_length = 0

    if(transactions.length >3){
        tx_length = transactions.length % 3
    }

    console.log("Length: ", transactions.length, " -tx: ", tx_length)


    for(let i = 0; i < tx_length; i++){
        let type = i % 2 == 0 ? "Deposit" : "Withdraw"

        // console.log("Timestamp: ", resp[i].timestamp, " -cv: ")
        dateFormat = new Date(parseInt(transactions[i].createdAt) * 1000)
        date_resp = dateFormat.getDate()+ "/" +(dateFormat.getMonth()+1)+
           "/"+dateFormat.getFullYear()+
           " "+dateFormat.getHours()+
           ":"+dateFormat.getMinutes()+
           ":"+dateFormat.getSeconds();

        let tx_detail = await axios.get(`https://api-baobab.klaytnscope.com/v2/txs/${transactions[i].txHash}/ftTransfers`)
        // console.log("Tx_detail: ", tx_detail.data.result)
        let amount = 0
        if(tx_detail.data.result.length >= 1){
            amount = tx_detail.data.result[0].amount / (10**17)
        }

        let his_detail = {
            "wallet":transactions[i].fromAddress,
            "type":type,
            "amount":amount,
            "tx_hash":transactions[i].txHash,
            "url":`https://baobab.klaytnscope.com/tx/${transactions[i].txHash}?tabId=internalTx`,
            "timestamp": date_resp
        }

        listTx.push(his_detail)
    }

    return listTx
}

app.get('/v1/history', async (req, res) =>{
    let user_id = req.query.wallet
    let chain = req.query.chain
    if(chain == "evm" || !chain){
        let resp_his = await evm_history(user_id)
        res.json(resp_his)
        return
    }
    let digest = await get_digest(user_id)
    let transactions = digest.result.data1h
    
    let resp = []

    for(let i = 0; i < transactions.length; i++){
        let txInfo = await history(transactions[i].digest)
        // console.log("Tx info: ", txInfo)
        if(txInfo.result.length == 0){
            continue
        }

        // console.log("Timestamp: ", transactions[i])
        txInfo.result[0].timestamp = transactions[i].timestampMs
        //making connection for blockchain developer if they generate multiple version f
        //finalized version to start: focus on building PQD <> DGT as the defi solution 
        let desofi_protocol = async function dgt(){
            
        }
        resp.push(txInfo.result[0])
    }

    // let resp = await history("6xKtWLEizBRy3hoJQZkRWu95H8iJKvakn47MbEQ2hMGJ")
    console.log("History resp: ", resp)
    let res_history = []
    for(let i = 0; i < resp.length; i++){
        let type = resp[i].type
        type = type.split("::")
        type = type[2] ? type[2] : "nil"
        type = type == "DepositEvent" ? "Gửi" : "Rút"

        // console.log("Timestamp: ", resp[i].timestamp, " -cv: ")
        dateFormat = new Date(parseInt(resp[i].timestamp))
        date_resp = dateFormat.getDate()+ "/" +(dateFormat.getMonth()+1)+
           "/"+dateFormat.getFullYear()+
           " "+dateFormat.getHours()+
           ":"+dateFormat.getMinutes()+
           ":"+dateFormat.getSeconds();

        let his_detail = {
            "wallet":resp[i].sender,
            "type":type,
            "amount":resp[i].parsedJson.amount,
            "tx_hash":resp[i].id.txDigest,
            "url":`https://suiexplorer.com/txblock/${resp[i].id.txDigest}?network=testnet`,
            "timestamp": date_resp
        }

        res_history.push(his_detail)
    }

    res.json(res_history)
})

/*
    ===============Vault Route===============
*/

app.get('/vaults', async (req, res) => {
    let request = req.query.assetAddress
    // let resp = await axios.get('http://109.123.233.65:3002/api/vaults')
    let resp = [{
        "vault_name": "dgt1",
        "manager": "dgt_manager",
        "vault_desc": "",
        "vault_adr": "0x312ms824234",
        "return":24,
        "assets":["CETUS", "SUI", "SUILIEN"],
        "created_at":1231,
        "updated_at":12312,
    }]

    res.json(resp)
})

app.get('/top_vaults', async (req, res) => {
    let option = req.query.option 
    let resp = {
        "top_vaults":[
            {
                "vault_name": "dgt1",
                "manager": "dgt_manager",
                "vault_desc": "",
                "vault_adr": "0x312ms824234",
                "return":24
            },
            {
                "vault_name": "dgt2",
                "manager": "dgt_manager_v1",
                "vault_desc": "stable profit",
                "vault_adr": "0x312ms8wrwerwe24234",
                "return":27
            },
            {
                "vault_name": "dgt3",
                "manager": "dgt_manager_v2",
                "vault_desc": "advance profit",
                "vault_adr": "0x312ms8242342411",
                "return":30
            }
        ]
    }
        
    res.json(resp)
})

app.post('/v1/create_vault', async (req, res) =>{
    let request = {
        vault_name: req.body.vault_name,
        manager: req.body.manager,
        vault_desc: req.body.vault_desc,
        vault_adr: req.body.vault_adr,
        symbol: req.body.symbol,
        deposit_asset: req.body.deposit_asset,
        management_fee: req.body.management_fee,
        performance_fee: req.body.performance_fee,
        deposit_limit: req.body.deposit_limit,
        lockup_time: req.body.lockup_time,
        profit_est: req.body.profit_est,
        loss_est: req.body.loss_est
    }
    console.log("DigiTrust create vault")
    let resp = await axios.post(
        "http://109.123.233.65:3002/api/create_vault",
        {
          vault_name: request.vault_name,
          manager: request.manager,
          vault_desc: request.vault_desc,
          vault_adr: request.vault_adr,
          symbol: request.symbol,
          deposit_asset: request.deposit_asset,
          management_fee: request.management_fee,
          performance_fee: request.performance_fee,
          deposit_limit: request.deposit_limit,
          lockup_time: request.lockup_time,
          profit_est: request.profit_est,
          loss_est: request.loss_est,
        }
      );

    console.log("Resp: ", resp)
    res.json({
        code: 0,
        data: resp.data
    })
})


app.listen(process.env.PORT || 3001, () =>{
    console.log("Listening at 3001")
});

module.exports = app;