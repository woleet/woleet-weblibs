interface Transaction {
    blockHash: string
    confirmations: number
    confirmedOn: Date
    opReturn: string
    txId: string
}

interface Hash extends string {
}

interface Branch {
    parent: string
    left: string
    right: string
}

interface Receipt {
    header: {
        chainpoint_version: "1.0"
        hash_type: "SHA-256"
        merkle_root: string
        tx_id: string
        timestamp: number
    },
    target: {
        "target_hash": string,
        "target_uri": string,
        "target_proof": Array<Branch>
    },
    signature?: {
        signedHash: string,
        pubKey: string,
        signature: string,
        identityURL?: string
    },
    extra: Array<Object>
}

interface Proof {
    confirmations: number
    confirmedOn: Date
    receipt: Receipt
    signature?: SignatureValidationResult
}

interface SignatureValidationResult {
    valid: boolean
    reason?: string
}

declare namespace woleet {

    namespace transaction {
        function get(transactionID: string): Promise<Transaction>;

        function setDefaultProvider(api: string);
    }

    namespace receipt {
        function get(anchorID: string): Promise<Receipt>;

        function validate(receipt: Object): boolean;
    }

    namespace anchor {
        const types: {
            FILE_HASH: number;
            SIGNATURE: number;
            BOTH: number;
        };

        function getAnchorIDs(hash: string, type?: number, size?: Number): Promise<Array<string>>;

        function create(hash: string | File, progressCallback?: Function): Promise<>;
    }

    namespace signature {
        function validateIdentity(identityUrl: string, pubKey: string): Promise<SignatureValidationResult>;

        function validateSignature(message: string, address: string, signature: string): Promise<SignatureValidationResult>;
    }

    namespace crypto {
        class sha256 {
            update(data:Uint8Array|string):this
            digest(encoding?:string):string
        }
    }

    namespace file {
        class Hasher {
            constructor();

            on(event: 'start' | 'result' | 'progress' | 'error', callback: Function);

            start(files: File | FileList);

            cancel();

            isReady(): boolean;
        }
    }

    function isSHA256(hash: string): boolean;

    namespace verify {
        function WoleetDAB(hash: string | File, progressCallback?: Function): Promise<Array<Proof>>;

        function DAB(hash: string | File, receipt: Object, progressCallback?: Function): Promise<Proof>;
    }
}