import { ToDontStack } from "./ToDontStack";
import { App } from "@serverless-stack/resources";

export default function (app: App) {
  // set default props for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  
  // add our ToDontStack to the application
  app.stack(ToDontStack);
}
