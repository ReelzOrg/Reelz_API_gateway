import 'dotenv/config.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Response } from 'express';
import { requiredEnv } from '../../utils/general.js';

export const s3 = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: requiredEnv("AWS_ACCESS_KEY", ""),
		secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY", "")
	}
});

export async function getS3SignedUrl(filePath: string, fileType: string) {
	const command = new PutObjectCommand({
		Bucket: "reelzapp",
		Key: filePath,
		ContentType: fileType,
		// ACL: "public-read",
		// Body: await readFile(file)
	});

	console.log("The file type of the new post is:", fileType);

	try {
		const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
		console.log("got the signed url", signedUrl);

		return {
			success: true,
			uploadURL: signedUrl,
			fileURL: `https://reelzapp.s3.us-east-1.amazonaws.com/${filePath}`
		}
		// res.json({
		//   success: true,
		//   uploadURL: signedUrl,
		//   fileURL: `https://reelzapp.s3.us-east-1.amazonaws.com/${filePath}`
		// })
	} catch (err: any) {
		console.log("Error while generating a url", err);
		// res.status(500).json({ success: false, error: err.message })
		return {
			success: false,
			error: err.message
		}
	}
}

export async function getMultipleSignedUrls(bucketName: string, fileKeys: string[], fileTypes: string[]) {
	const urls = await Promise.all(
		fileKeys.map(async (key, index) => {
			const command = new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				ContentType: fileTypes[index],
				// ACL: 'public-read',
			});

			try {
				const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
				return signedUrl;
			} catch (err) {
				console.log("Error while generating a url for index: ", index, "\n Error:", err);
				return ""
				// return res.status(500).json({ success: false, error: err.message })
			}
		})
	);

	// console.log("These are the urls of multiple uplaod to s3:", urls);
	return { success: true, uploadURL: urls, fileURL: fileKeys.map((key) => `https://reelzapp.s3.us-east-1.amazonaws.com/${key}`) };
	// return res.json({ success: true, uploadURLs: urls, fileURLs: fileKeys.map((key) => `https://reelzapp.s3.us-east-1.amazonaws.com/${key}`)  });

	// return urls;
}
