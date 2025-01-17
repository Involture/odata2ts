import { ConfigFileOptions, EmitModes, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  debug: false,
  allowRenaming: true,
  emitMode: EmitModes.ts,
  prettier: true,
  services: {
    odata: {
      serviceName: "example",
      source: "resource/edge-cases.xml",
      output: "src/generated/edge-cases",
    },
    multipleSchemas: {
      source: "resource/multiple-schemas.xml",
      output: "src/generated/multiple-schemas",
    },
    multipleSchemas2: {
      source: "resource/multiple-schemas2.xml",
      output: "src/generated/multiple-schemas2",
    },
  },
};

export default config;
