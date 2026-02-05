import 'dotenv/config.js';
import neo4j from 'neo4j-driver';
import { OGM } from '@neo4j/graphql-ogm';
import { requiredEnv } from '../utils/general.js';

const typeDefs = `
  type User {
    _id: ID! @id
    username: String! @unique
    createdAt: DateTime! @timestamp(operations: [CREATE])
  }
`;

//Establish Neo4j connection
const neo4jUri: string = String(requiredEnv("NEO4J_URI", ""));
const neo4jUsername: string = String(requiredEnv("NEO4J_USERNAME", ""));
const neo4jPassword: string = String(requiredEnv("NEO4J_PASSWORD", ""));
export const neo4jDriver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUsername, neo4jPassword), { maxConnectionPoolSize: 100, connectionTimeout: 30000 });
export const ogm = new OGM({ typeDefs, driver: neo4jDriver });
await ogm.init();

/**
 * Execute a raw Cypher query with parameters. User this function for complex queries
 * @param queryStr - Raw Cypher Query
 * @param params - Query parameters
 * @param name - Name of the query
 * @returns Query result
 */
export async function neo4jQuery(queryStr: string, params = {}, name = "default") {
	const session = neo4jDriver.session();
	try {
		const result: neo4j.QueryResult<neo4j.RecordShape> = await session.run(queryStr, params);
		return result.records;
	} catch (err) {
		console.error("Neo4j Error on the query " + name + ":", err);
		return [];
	} finally {
		await session.close();
	}
}
//
/**
 * This function creates a new user node with the **ogm module**
 * @param username - Username of the user
 * @returns The node created in neo4j for the user
 */
export async function createNeo4jUserNode(username: string) {
	try {
		const User = ogm.model("User");
		const { users } = await User.create({ input: [{ username }] });
		return users[0];
	} catch (err) {
		console.error("OGM User Creation Error:", err);
	}
}

/**
 * This function creates a new user node with the **driver module**
 * @remarks
 * This is not used
 * @param username - Username of the user
 * @returns the created user node
 */
// export async function createUserWithDriver(username: string, _id: string) {
//   const query = `
//     CREATE (u:User {
//       _id: ${_id},
//       username: ${username},
//       createdAt: datetime()
//     })
//     RETURN u
//   `;
//   const result = await neo4jQuery(query, { username });
//   return result[0].get("u");
// }