interface Transaction {
    blockHash: string
    confirmations: 3897
    confirmedOn: Date
    opReturn: string
    txId: string
}

interface Branch {
    parent: string,
    left: string,
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
    extra: Array<Object>
}

interface AnchorIDsPage {
    content: Array<string>
    totalPages: number
    totalElements: number
    last: boolean
    first: boolean
    numberOfElements: number
    size: number
    number: number
}

interface Proof {
    confirmations: number,
    date: Date
    receipt: Receipt
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
        function getAnchorIDs(hash: string, size?: Number): Promise<AnchorIDsPage>;
    }

    namespace file {
        class Hasher {
            constructor();

            on(event: string, callback: Function);

            start(files: File|FileList);

            isReady(): boolean;
        }
    }

    function isSHA256(hash: string): boolean;

    namespace verify {
        function WoleetDAB(hash: string|File): Promise<Array<Proof>>;

        function DAB(hash: string|File, receipt: Object): Promise<Proof>;
    }
}