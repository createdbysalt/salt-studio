import {base64FromBytes, sha256Bytes} from '@/lib/proposal/frozenDocument'

const encoder = new TextEncoder()

export const proposalV3FixtureIds = {
  completeMsa: 'complete-msa',
  msaBodyNoPdf: 'msa-body-no-pdf',
  missingMsaOnInsert: 'missing-msa-on-insert',
  previewToken: 'preview-token',
  preShipMatchWithPdf: 'pre-ship-match-with-pdf',
  preShipMismatch: 'pre-ship-mismatch',
  preShipNoPdf: 'pre-ship-no-pdf',
} as const

export const proposalV3FixtureSigner = {
  fullName: 'Test Signer',
  legalName: 'Fixture Organization LLC',
  address: '100 Test Street\nFixture City, Test Region 10000\nUnited States',
  email: 'signer.fixture@example.test',
}

export const proposalV3FixturePdfBytes = encoder.encode('%PDF-1.4\n% fixture MSA\n%%EOF\n')

export const proposalV3FixturePdf = {
  filename: 'fixture-master-services-agreement.pdf',
  contentType: 'application/pdf',
  sha256: sha256Bytes(proposalV3FixturePdfBytes),
  bytesBase64: base64FromBytes(proposalV3FixturePdfBytes),
}
