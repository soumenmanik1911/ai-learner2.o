import Vapi from "@vapi-ai/web";

const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

if (!vapiToken) {
  console.warn('Vapi AI token not found. Voice features will not work.');
}

export const vapi = new Vapi(vapiToken || '');