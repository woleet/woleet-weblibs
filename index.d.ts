declare namespace woleet {

  interface HashFunction {
    update(data: Uint8Array | string): HashFunction

    digest(encoding?: string): string
  }

  interface Signature {
    signedHash: string,
    signedIdentity?: string,
    signedIssuerDomain?: string,
    identityURL?: string
    pubKey: string,
    signature: string,
  }

  interface ReceiptV1 {
    header: {
      chainpoint_version: '1.0'
      hash_type: 'SHA-256'
      merkle_root: string
      tx_id: string
      timestamp: number
    },
    target: {
      'target_hash': string,
      'target_uri': string,
      'target_proof': Array<{
        parent: string
        left: string
        right: string
      }>
    },
    signature?: Signature
  }

  interface ReceiptV2 {
    '@context': string,
    type: string,
    targetHash: string,
    merkleRoot: string,
    proof: Array<{ left?: string, right?: string }>,
    anchors: Array<{ type: string, sourceId: string }>,
    signature?: Signature
  }

  type Receipt = ReceiptV1 | ReceiptV2

  interface Identity {
    commonName: string
    emailAddress: string
    organizationalUnit: string
    organization: string
    locality: string
    country: string
  }

  interface ReceiptVerificationStatus {
    code: string
    confirmations?: number
    timestamp?: Date
    identityVerificationStatus?: {
      code: string
      identity: Identity
      signedIdentity: Identity
    }
    receipt: Receipt
  }

  interface SignatureValidationResult {
    valid: boolean
    reason: string
  }

  interface Transaction {
    blockHash: string
    confirmations: number
    timestamp: Date
    opReturn: string
    txId: string
  }

  interface IdentityValidationResult {
    valid: boolean
    reason: string
    identity: Identity
    signedIdentity: Identity
  }

  namespace config {
    function setDefaultTransactionProvider(transactionProvider: string);

    function setDefaultWoleetApiUrl(woleetApiUrl: string);
  }

  namespace transaction {

    function get(transactionID: string): Promise<Transaction>;
  }

  namespace receipt {
    function get(anchorID: string): Promise<Receipt>;

    function validate(receipt: Object): boolean;
  }

  namespace anchor {
    enum Type {
      DATA = 1,
      SIGNATURE = 2,
      BOTH = 3
    }

    function getAnchorIDs(hash: string, type?: Type, size?: Number): Promise<Array<string>>;

    function create(hash: string | File, progressCallback?: Function): Promise<any>;
  }

  namespace signature {
    function validateIdentity(identityUrl: string, pubKey: string, signedIdentity: string,
                              signedIssuerDomain: string): Promise<SignatureValidationResult>;

    function validateSignature(message: string, address: string, signature: string): Promise<IdentityValidationResult>;
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

    function receipt(receipt: Receipt): Promise<ReceiptVerificationStatus>;
  }
}

export = woleet
