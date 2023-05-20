const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const ethUtil = require('ethereumjs-util');

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const isValidSignature = verifySignature(sender, signature);

  if (!isValidSignature) {
    res.status(400).send({ message: "Invalid signature!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function verifySignature(sender, signature) {
  // Here, we'll use a hardcoded message for signing transactions
  // In a real-world app, you should use a unique message for each transaction
  const message = 'Authorize Transaction';
  const msgHash = ethUtil.keccak(Buffer.from(message));
  const signatureBuffer = ethUtil.toBuffer(signature);

  try {
    const {
      v, r, s,
    } = ethUtil.fromRpcSig(signatureBuffer);

    const publicKey = ethUtil.ecrecover(msgHash, v, r, s);
    const senderAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(publicKey));

    return senderAddress === sender;
  } catch (error) {
    return false;
  }
}
