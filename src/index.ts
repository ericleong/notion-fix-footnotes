import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  ParagraphBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  TextRichTextItemResponse,
  QuoteBlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";

dotenv.config();

function parseForReferences(
  results: Array<PartialBlockObjectResponse | BlockObjectResponse>
) {
  const references = {
    fn: new Map<string, BlockObjectResponse>(),
    fnref: new Map<string, NumberedListItemBlockObjectResponse>(),
  };

  results.forEach((block) => {
    if (
      (block as BlockObjectResponse)?.type === "paragraph" &&
      (block as ParagraphBlockObjectResponse)
    ) {
      const paragraph = block as ParagraphBlockObjectResponse;
      paragraph.paragraph?.rich_text?.forEach((item) => {
        if (item.href) {
          const textItem = item as TextRichTextItemResponse;

          if (textItem.text.link?.url.startsWith("about:blank#fn")) {
            references.fn.set(textItem.text.content, paragraph);
          }
        }
      });
    } else if (
      (block as QuoteBlockObjectResponse)?.type === "quote" &&
      (block as QuoteBlockObjectResponse)
    ) {
      const quote = block as QuoteBlockObjectResponse;
      quote.quote?.rich_text?.forEach((item) => {
        if (!item.href) {
          // search for a number if there is no link
          const content = (item as TextRichTextItemResponse)?.text.content;

          var refnum = content.substring(content.lastIndexOf(".") + 1);

          if (!(parseInt(refnum, 10) > 0)) {
            if (content.length - content.lastIndexOf("”") < 5) {
              refnum = parseInt(
                content.substring(content.lastIndexOf("”") + 1)
              ).toString();
            } else if (content.lastIndexOf("…") >= 0) {
              refnum = parseInt(
                content.substring(content.lastIndexOf("…") + 1)
              ).toString();
            } else if (content.lastIndexOf("?") >= 0) {
              refnum = parseInt(
                content.substring(content.lastIndexOf("?") + 1)
              ).toString();
            }
          }
          if (parseInt(refnum, 10) > 0) {
            references.fn.set(refnum, quote);
          }
        }
      });
    } else if (
      (block as BlockObjectResponse)?.type === "numbered_list_item" &&
      (block as NumberedListItemBlockObjectResponse)
    ) {
      (
        block as NumberedListItemBlockObjectResponse
      ).numbered_list_item?.rich_text?.forEach((item) => {
        if (item.href) {
          if ((item as TextRichTextItemResponse)?.text.link) {
            const textItem = item as TextRichTextItemResponse;

            if (textItem.text.link?.url.startsWith("about:blank#fnref")) {
              const refnum = textItem.text.link?.url.substring(
                "about:blank#fnref".length
              );
              references.fnref.set(
                refnum,
                block as NumberedListItemBlockObjectResponse
              );
            }
          }
        }
      });
    }
  });

  return references;
}

async function replaceLinks(
  notion: Client,
  pageUrl: string,
  references: {
    fn: Map<string, BlockObjectResponse>;
    fnref: Map<string, NumberedListItemBlockObjectResponse>;
  }
) {
  for (let [refnum, block] of references.fn) {
    if (
      (block as BlockObjectResponse)?.type === "paragraph" &&
      (block as ParagraphBlockObjectResponse)
    ) {
      const richText: {
        text: { content: string; link: { url: string } } | { content: string };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color:
            | "default"
            | "gray"
            | "brown"
            | "orange"
            | "yellow"
            | "green"
            | "blue"
            | "purple"
            | "pink"
            | "red"
            | "gray_background"
            | "brown_background"
            | "orange_background"
            | "yellow_background"
            | "green_background"
            | "blue_background"
            | "purple_background"
            | "pink_background"
            | "red_background";
        };
      }[] = [];

      (block as ParagraphBlockObjectResponse).paragraph?.rich_text?.forEach(
        (text) => {
          if (text as TextRichTextItemResponse) {
            const textItemResponse = text as TextRichTextItemResponse;
            const responseText = textItemResponse.text;

            if (responseText.link) {
              var url;
              if (responseText.link.url.startsWith("about:blank#fn")) {
                const urlref = responseText.link.url.substring(
                  "about:blank#fn".length
                );

                url =
                  pageUrl +
                  "#" +
                  references.fnref.get(urlref)?.id.replaceAll("-", "");
              } else {
                url = responseText.link.url;
              }

              richText.push({
                text: {
                  content: responseText.content,
                  link: {
                    url: url,
                  },
                },
                annotations: textItemResponse.annotations,
              });
            } else {
              richText.push({
                text: {
                  content: responseText.content,
                },
                annotations: textItemResponse.annotations,
              });
            }
          }
        }
      );

      await notion.blocks.update({
        paragraph: {
          rich_text: richText,
        },
        block_id: block.id,
      });
    } else if (
      (block as QuoteBlockObjectResponse)?.type === "quote" &&
      (block as QuoteBlockObjectResponse)
    ) {
      const richText: {
        text: { content: string; link: { url: string } } | { content: string };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color:
            | "default"
            | "gray"
            | "brown"
            | "orange"
            | "yellow"
            | "green"
            | "blue"
            | "purple"
            | "pink"
            | "red"
            | "gray_background"
            | "brown_background"
            | "orange_background"
            | "yellow_background"
            | "green_background"
            | "blue_background"
            | "purple_background"
            | "pink_background"
            | "red_background";
        };
      }[] = [];

      (block as QuoteBlockObjectResponse).quote?.rich_text?.forEach((text) => {
        if (text as TextRichTextItemResponse) {
          const textItemResponse = text as TextRichTextItemResponse;

          const responseText = textItemResponse.text;

          if (responseText.content.lastIndexOf(refnum) >= 0) {
            const url =
              pageUrl +
              "#" +
              references.fnref.get(refnum)?.id.replaceAll("-", "");

            const refnumIndex = responseText.content.lastIndexOf(refnum);
            const quoteText = responseText.content.substring(0, refnumIndex);
            const refnumText = responseText.content.substring(refnumIndex);

            richText.push({
              text: {
                content: quoteText,
              },
              annotations: textItemResponse.annotations,
            });

            richText.push({
              text: {
                content: refnumText,
                link: {
                  url: url,
                },
              },
              annotations: textItemResponse.annotations,
            });
          }
        }
      });

      if (richText.length > 0) {
        await notion.blocks.update({
          quote: {
            rich_text: richText,
          },
          block_id: block.id,
        });
      }
    }
  }

  for (let [refnum, block] of references.fnref) {
    const richText: {
      text: { content: string; link: { url: string } } | { content: string };
      annotations: {
        bold: boolean;
        italic: boolean;
        strikethrough: boolean;
        underline: boolean;
        code: boolean;
        color:
          | "default"
          | "gray"
          | "brown"
          | "orange"
          | "yellow"
          | "green"
          | "blue"
          | "purple"
          | "pink"
          | "red"
          | "gray_background"
          | "brown_background"
          | "orange_background"
          | "yellow_background"
          | "green_background"
          | "blue_background"
          | "purple_background"
          | "pink_background"
          | "red_background";
      };
    }[] = [];

    (
      block as NumberedListItemBlockObjectResponse
    ).numbered_list_item?.rich_text?.forEach((text) => {
      if (text as TextRichTextItemResponse) {
        const textItemResponse = text as TextRichTextItemResponse;
        const responseText = textItemResponse.text;

        if (responseText.link) {
          var url;
          if (responseText.link.url.startsWith("about:blank#fnref")) {
            url =
              pageUrl + "#" + references.fn.get(refnum)?.id.replaceAll("-", "");
          } else {
            url = responseText.link.url;
          }

          richText.push({
            text: {
              content: responseText.content,
              link: {
                url: url,
              },
            },
            annotations: textItemResponse.annotations,
          });
        } else {
          richText.push({
            text: {
              content: responseText.content,
            },
            annotations: textItemResponse.annotations,
          });
        }
      }
    });

    await notion.blocks.update({
      numbered_list_item: {
        rich_text: richText,
      },
      block_id: block.id,
    });
  }
}

async function getPages(notion: Client) {
  var response = await notion.search({
    filter: {
      property: "object",
      value: "page",
    },
  });

  var results = [...response.results];

  while (response.has_more && response.next_cursor != null) {
    response = await notion.search({
      filter: {
        property: "object",
        value: "page",
      },
      start_cursor: response.next_cursor,
    });

    results = [...results, ...response.results];
  }

  return results;
}

async function replaceLinksInPage(notion: Client, page: PageObjectResponse) {
  var results: Array<PartialBlockObjectResponse | BlockObjectResponse> = [];

  var response = await notion.blocks.children.list({
    block_id: page.id,
  });

  results = [...response.results];

  while (response.has_more && response.next_cursor != null) {
    response = await notion.blocks.children.list({
      block_id: page.id,
      start_cursor: response.next_cursor,
    });

    results = [...results, ...response.results];
  }

  const references = parseForReferences(results);
  await replaceLinks(notion, page.url, references);
}

async function main() {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const pages = await getPages(notion);

  for (var page of pages) {
    if (
      (page as PageObjectResponse) &&
      (page as PageObjectResponse)?.object == "page"
    ) {
      await replaceLinksInPage(notion, page as PageObjectResponse);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
