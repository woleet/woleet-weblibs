interface Transaction {
  blockHash: string
  confirmations: number
  timestamp: Date
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

interface ReceiptSignature {
  signedHash: string,
  pubKey: string,
  signature: string,
  identityURL?: string
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
  signature?: ReceiptSignature,
  extra: Array<Object>
}

interface ReceiptV2 {
  '@context': string,
  type: string,
  targetHash: string,
  merkleRoot: string,
  proof: Array<{ left?: string, right?: string }>,
  anchors: Array<{ type: string, sourceId: string }>,
  signature?: ReceiptSignature
}

interface ReceiptVerificationStatus {
  confirmations?: number
  timestamp?: Date
  receipt: Receipt
  code: string
  identityVerificationStatus?: {
    code: string
  }
}

interface SignatureValidationResult {
  valid: boolean
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

  namespace identity {
    function getRandomSignature(identityUrl: string, pubKey: string, leftData: string): Promise<{ signature: string, rightData: string }>;
  }

  namespace crypto {
    class sha256 {
      update(data: Uint8Array | string): this

      digest(encoding?: string): string
    }
  }

  namespace file {
    class Hasher {
      constructor();

      on(event: 'start' | 'result' | 'progress' | 'error', callback: Function);

      start(files: File | FileList | File[]);

      cancel();

      skip();

      isReady(): boolean;
    }

    function hashFileOrCheckHash(file: File | string, progressCallback?: Function)
  }

  function isSHA256(hash: string): boolean;

  namespace verify {
    function WoleetDAB(hash: string | File, progressCallback?: Function): Promise<Array<ReceiptVerificationStatus>>;

    function DAB(hash: string | File, receipt: Object, progressCallback?: Function): Promise<ReceiptVerificationStatus>;

    function receipt(receipt: Object): Promise<ReceiptVerificationStatus>;
  }
}
