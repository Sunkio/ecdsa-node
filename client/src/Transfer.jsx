import { useState } from "react";
import server from "./server";
import ethUtil from 'ethereumjs-util';

function signMessage(senderPrivateKey, message) {
  const privateKeyBuffer = Buffer.from(senderPrivateKey, 'hex');
  const msgHash = ethUtil.keccak(Buffer.from(message));

  const sig = ethUtil.ecsign(msgHash, privateKeyBuffer);
  return ethUtil.bufferToHex(ethUtil.toRpcSig(sig.v, sig.r, sig.s));
}

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // Here we use a hardcoded private key for demo purposes only.
    // NEVER do this in a real-world application. Use a wallet like MetaMask to handle private keys.
    const senderPrivateKey = 'your_sender_private_key_here';

    // Use the same message as in the server for verifying the signature
    const message = 'Authorize Transaction';

    const generatedSignature = signMessage(senderPrivateKey, message);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: generatedSignature,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;