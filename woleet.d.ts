interface Transaction {
  blockHash: string
  confirmations: number
  timestamp: Date
  opReturn: string
  txId: string
}

interface Hash extends String {}

interface Branch {
  parent: string
  left: string
  right: string
}

interface ReceiptSignature {
  signedHash: string,
  signedIdentity?: string,
  signedIssuerDomain?: string,
  identityURL?: string
  pubKey: string,
  signature: string,
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
  receipt: Receipt
  code: string
  confirmations?: number
  timestamp?: Date
  identityVerificationStatus?: {
    code: string
  }
}

interface SignatureValidationResult {
  valid: boolean
}

interface HashFunction {
  update(data: Uint8Array | string): HashFunction

  digest(encoding?: string): string
}

declare namespace woleet {

  const version: string;

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
      DATA: number;
      SIGNATURE: number;
      BOTH: number;
    };

    function getAnchorIDs(hash: string, type?: number, size?: Number): Promise<Array<string>>;

    function create(hash: string | File, progressCallback?: Function): Promise<any>;
  }

  namespace signature {
    function validateIdentity(identityUrl: string, pubKey: string, signedIdentity: string): Promise<SignatureValidationResult>;

    function validateSignature(message: string, address: string, signature: string): Promise<SignatureValidationResult>;
  }

  namespace identity {
    function getIdentity(identityUrl: string, pubKey: string, leftData: string): Promise<{ signature: string, rightData: string }>;
  }

  namespace crypto {
    function sha256(): HashFunction
  }

  namespace file {
    class Hasher {
      constructor();

      on(event: 'start' | 'result' | 'progress' | 'error' | 'cancel' | 'skip', callback: Function);

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

export = woleet
