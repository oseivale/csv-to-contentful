import { createClient } from "contentful-management";

export const client = createClient({
  accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
});

export const getEnvironment = async () => {
  const space = await client.getSpace(
    process.env.REACT_APP_CONTENTFUL_SPACE_ID
  );
  return space.getEnvironment(process.env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID);
};

export const createEntry = async (contentTypeId, fields) => {
  const environment = await getEnvironment();
  const entry = await environment.createEntry(contentTypeId, { fields });
  await entry.publish();
  return entry;
};

export const stringToRichText = (text) => {
  return {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value: text,
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };
};