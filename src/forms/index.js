import React, { useContext, useState } from 'react';
import { MultisignContext } from '../context';
import { Button } from '../button';
import { IpfsLink } from '../link';
import { ErrorMessage } from '../messages';


export function ContractSelectionForm() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Set the component state
    const [contractAddress, setContractAddress] = useState(context.contractAddress);

    // Define the on submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        await context.setContractAddress(contractAddress);
     };

    return (
        <>
            {context.errorMessage &&
                <ErrorMessage message={context.errorMessage} onClick={() => context.setErrorMessage(undefined)} />
            }

            <section>
                <form onSubmit={handleSubmit}>
                    <label className='form-input'>Select multisign:
                        {' '}
                        <input
                            type='text'
                            list='multisignContracts'
                            spellCheck='false'
                            minLength='36'
                            maxLength='36'
                            className='contract-address-input'
                            value={contractAddress}
                            onMouseDown={() => setContractAddress('')}
                            onChange={(e) => setContractAddress(e.target.value)}
                        />
                        <datalist id='multisignContracts'>
                            <option value=''></option>
                            <option value='KT1RtYAfoiFNkgZxQJmkSAEyQitfEQHyX3Cb'>test multising 1</option>
                        </datalist>
                    </label>
                    <input type='submit' value='load' />
                </form>
            </section>
        </>
    );
}

export function CreateProposalForms() {
    // Get the multisign context
    const context = useContext(MultisignContext);

    // Return if the user is not connected
    if (!context.activeAccount) {
        return (
            <section>
                <p>You need to sync your wallet to be able to create proposal.</p>
            </section>
        );
    }

    // Return if the user is not one of the multisign users
    if (!(context.storage && context.storage.users.includes(context.activeAccount.address))) {
        return (
            <section>
                <p>Only multisign users can create new proposals.</p>
            </section>
        );
    }

    return (
        <>
            {context.errorMessage &&
                <ErrorMessage message={context.errorMessage} onClick={() => context.setErrorMessage(undefined)} />
            }

            <section>
                <h2>Transfer tez proposal</h2>
                <TransferTezProposalForm
                    handleSubmit={context.createTransferMutezProposal}
                />
            </section>

            <section>
                <h2>Transfer token proposal</h2>
                <TransferTokenProposalForm
                    handleSubmit={context.createTransferTokenProposal}
                />
            </section>

            <section>
                <h2>Text proposal</h2>
                <TextProposalForm
                    uploadToIpfs={context.uploadToIpfs}
                    handleSubmit={context.createTextProposal}
                />
            </section>

            <section>
                <h2>Lambda function proposal</h2>
                <LambdaFunctionProposalForm
                    handleSubmit={context.createLambdaFunctionProposal}
                />
            </section>

            <section>
                <h2>Add user proposal</h2>
                <AddUserProposalForm
                    handleSubmit={context.createAddUserProposal}
                />
            </section>

            <section>
                <h2>Remove user proposal</h2>
                <RemoveUserProposalForm
                    users={context.storage.users}
                    handleSubmit={context.createRemoveUserProposal}
                />
            </section>

            <section>
                <h2>Minimum votes proposal</h2>
                <MinimumVotesProposalForm
                    defaultValue={context.storage.minimum_votes}
                    handleSubmit={context.createMinimumVotesProposal}
                />
            </section>

            <section>
                <h2>Expiration time proposal</h2>
                <ExpirationTimeProposalForm
                    defaultValue={context.storage.expiration_time}
                    handleSubmit={context.createExpirationTimeProposal}
                />
            </section>
        </>
    );
}

function TransferTezProposalForm(props) {
    // Set the component state
    const [transfers, setTransfers] = useState([
        {amount: 0, destination: ''}
    ]);

    // Define the on change handler
    const handleChange = (index, parameter, value) => {
        // Create a new transfers array
        const newTransfers = transfers.map((transfer, i) => {
            // Create a new transfer
            const newTransfer = {
                amount: transfer.amount,
                destination: transfer.destination
            };

            // Update the value if we are at the correct index position
            if (i === index) {
                newTransfer[parameter] = value;
            }

            return newTransfer;
        });

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on click handler
    const handleClick = (e, increase) => {
        e.preventDefault();

        // Create a new transfers array
        const newTransfers = transfers.map((transfer) => (
            {amount: transfer.amount, destination: transfer.destination}
        ));

        // Add or remove a transfer from the list
        if (increase) {
            newTransfers.push({amount: 0, destination: ''});
        } else if (newTransfers.length > 1) {
            newTransfers.pop();
        }

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(
            transfers.map((transfer) => ({
                amount: transfer.amount * 1000000,
                destination: transfer.destination
            }))
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='form-input'>
                <div className='transfers-input'>
                    {transfers.map((transfer, index) => (
                        <div key={index}  className='transfer-input'>
                            <label>Amount to transfer (ꜩ):
                                {' '}
                                <input
                                    type='number'
                                    min='0'
                                    step='0.000001'
                                    value={transfer.amount}
                                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                />
                            </label>
                            <br />
                            <label>Destination address:
                                {' '}
                                <input
                                    type='text'
                                    spellCheck='false'
                                    minLength='36'
                                    maxLength='36'
                                    className='tezos-wallet-input'
                                    value={transfer.destination}
                                    onChange={(e) => handleChange(index, 'destination', e.target.value)}
                                />
                            </label>
                        </div>
                    ))}
                </div>
                <Button text='+' onClick={(e) => handleClick(e, true)} />
                {' '}
                <Button text='-' onClick={(e) => handleClick(e, false)} />
            </div>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function TransferTokenProposalForm(props) {
    // Set the component state
    const [tokenContract, setTokenContract] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [transfers, setTransfers] = useState([
        {amount: 0, destination: ''}
    ]);

    // Define the on change handler
    const handleChange = (index, parameter, value) => {
        // Create a new transfers array
        const newTransfers = transfers.map((transfer, i) => {
            // Create a new transfer
            const newTransfer = {
                amount: transfer.amount,
                destination: transfer.destination
            };

            // Update the value if we are at the correct index position
            if (i === index) {
                newTransfer[parameter] = value;
            }

            return newTransfer;
        });

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on click handler
    const handleClick = (e, increase) => {
        e.preventDefault();

        // Create a new transfers array
        const newTransfers = transfers.map((transfer) => (
            {amount: transfer.amount, destination: transfer.destination}
        ));

        // Add or remove a transfer from the list
        if (increase) {
            newTransfers.push({amount: 0, destination: ''});
        } else if (newTransfers.length > 1) {
            newTransfers.pop();
        }

        // Update the component state
        setTransfers(newTransfers);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(tokenContract, tokenId, transfers);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='form-input'>
                <label>Token contract address:
                    {' '}
                    <input
                        type='text'
                        list='tokenContracts'
                        spellCheck='false'
                        minLength='36'
                        maxLength='36'
                        className='contract-address-input'
                        value={tokenContract}
                        onMouseDown={() => setTokenContract('')}
                        onChange={(e) => setTokenContract(e.target.value)}
                    />
                    <datalist id='tokenContracts'>
                        <option value=''></option>
                        <option value='KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'>OBJKT</option>
                        <option value='KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW'>hDAO</option>
                        <option value='KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6'>Tezzardz</option>
                        <option value='KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ'>PRJKTNEON</option>
                        <option value='KT1LbLNTTPoLgpumACCBFJzBEHDiEUqNxz5C'>Art Cardz</option>
                        <option value='KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ'>GOGOs</option>
                        <option value='KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ'>NEONZ</option>
                        <option value='KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih'>Randomly Common Skeles</option>
                        <option value='KT1PNcZQkJXMQ2Mg92HG1kyrcu3auFX5pfd8'>ZIGGURATS</option>
                    </datalist>
                </label>
                <br />
                <label>Token Id:
                    {' '}
                    <input
                        type='number'
                        min='0'
                        step='1'
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                    />
                </label>
                <br />
                <div className='transfers-input'>
                    {transfers.map((transfer, index) => (
                        <div key={index}  className='transfer-input'>
                            <label>Token editions:
                                {' '}
                                <input
                                    type='number'
                                    min='1'
                                    step='1'
                                    value={transfer.amount}
                                    onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                />
                            </label>
                            <br />
                            <label>Destination address:
                                {' '}
                                <input
                                    type='text'
                                    spellCheck='false'
                                    minLength='36'
                                    maxLength='36'
                                    className='tezos-wallet-input'
                                    value={transfer.destination}
                                    onChange={(e) => handleChange(index, 'destination', e.target.value)}
                                />
                            </label>
                        </div>
                    ))}
                </div>
                <Button text='+' onClick={(e) => handleClick(e, true)} />
                {' '}
                <Button text='-' onClick={(e) => handleClick(e, false)} />
            </div>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function TextProposalForm(props) {
    // Set the component state
    const [file, setFile] = useState(undefined);
    const [ipfsPath, setIpfsPath] = useState(undefined);

    // Define the on change handler
    const handleChange = (e) => {
        setFile(e.target.files[0]);
        setIpfsPath(undefined);
    };

    // Define the on click handler
    const handleClick = async (e) => {
        e.preventDefault();

        // Update the component state
        setIpfsPath(await props.uploadToIpfs(file));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(ipfsPath);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='form-input'>
                <label>File with the text to approve:
                    {' '}
                    <input
                        type='file'
                        onChange={handleChange}
                    />
                </label>
                {file &&
                    <div>
                        <Button text={ipfsPath? 'uploaded' : 'upload to IPFS'} onClick={handleClick} />
                        {' '}
                        {ipfsPath &&
                            <IpfsLink path={ipfsPath} />
                        }
                    </div>
                }
            </div>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function LambdaFunctionProposalForm(props) {
    // Set the component state
    const [michelineCode, setMichelineCode] = useState('');

    // Define the on change handler
    const handleChange = (e) => {
        setMichelineCode(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(michelineCode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className='form-input'>Lambda function code in Micheline format:
                {' '}
                <textarea
                    className='micheline-code'
                    spellCheck='false'
                    value={michelineCode}
                    onChange={handleChange}
                />
            </label>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function AddUserProposalForm(props) {
    // Set the component state
    const [user, setUser] = useState('');

    // Define the on change handler
    const handleChange = (e) => {
        setUser(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className='form-input'>User to add:
                {' '}
                <input
                    type='text'
                    spellCheck='false'
                    minLength='36'
                    maxLength='36'
                    className='tezos-wallet-input'
                    value={user}
                    onChange={handleChange}
                />
            </label>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function RemoveUserProposalForm(props) {
    // Set the component state
    const [user, setUser] = useState(props.users[0]);

    // Define the on change handler
    const handleChange = (e) => {
        setUser(e.target.value);
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className='form-input'>User to remove:
                {' '}
                <select value={user} onChange={handleChange}>
                    {props.users.map((userWallet, index) => (
                        <option key={index} value={userWallet}>
                            {userWallet}
                        </option>
                    ))}
                </select>
            </label>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function MinimumVotesProposalForm(props) {
    // Set the component state
    const [minimumVotes, setMinimumVotes] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setMinimumVotes(Math.round(e.target.value));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(minimumVotes);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className='form-input'>New minimum votes:
                {' '}
                <input
                    type='number'
                    min='1'
                    step='1'
                    value={minimumVotes}
                    onChange={handleChange}
                />
            </label>
            <input type='submit' value='send proposal' />
        </form>
    );
}

function ExpirationTimeProposalForm(props) {
    // Set the component state
    const [expirationTime, setExpirationTime] = useState(props.defaultValue);

    // Define the on change handler
    const handleChange = (e) => {
        setExpirationTime(Math.round(e.target.value));
    };

    // Define the on submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        props.handleSubmit(expirationTime);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label className='form-input'>New expiration time (days):
                {' '}
                <input
                    type='number'
                    min='1'
                    step='1'
                    value={expirationTime}
                    onChange={handleChange}
                />
            </label>
            <input type='submit' value='send proposal' />
        </form>
    );
}
