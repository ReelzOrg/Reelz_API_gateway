/**
 * const addDataToQueue = JSON.stringify({toProcessUrls, uploadType, post_id, timeStamp: Date.now()});
 * messages: [{
        value: addDataToQueue,
        headers: { 'x-trace-id': uuidv4() },
      }]
 */

export const mediaProcessingSchema = {
  type: "record",
  name: "MediaProcessingJob",
  namespace: "xyz.virajdoshi.reelz",
  fields: [
    {
      name: "toProcessUrls",
      type: {
        type: "array",
        items: {
          type: "record",
          name: "MediaItem",
          fields: [
            {
              name: "url",
              type: "string",
              doc: "The s3 url of the media file to be processed"
            },
            {
              name: "mediaType",
              type: {
                type: "enum",
                name: "MediaType",
                symbols: ["image", "video"]
              },
              doc: "The type of media (image, video)"
            }
          ]
        }
      },
      doc: "An array of objects which have the url and media type of the file to be processed"
    },
    {
      name: "uploadType",
      type: {
        type: "enum",
        name: "UploadType",
        symbols: ["post", "story", "reel"]
      },
      doc: "The type of upload (post, story, reel)"
    },
    {
      name: "post_id",
      type: "string",
      doc: "The id of the post to which the media belongs (uuid)"
    },
    {
      name: "timeStamp",
      type: "long",
      doc: "The timestamp of the request"
    },
    {
      name: "traceId",
      type: "string",
      doc: "The trace id of the request"
    }
  ]
}