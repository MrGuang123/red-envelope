import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RedEnvelopeModule = buildModule("RedEnvelopeModule", (m) => {
  const redEnvelope = m.contract("RedEnvelope");

  return { redEnvelope };
});

export default RedEnvelopeModule;
