

/**
 * Retrieves the latest 100 messages from the database, sorted by timestamp in ascending order.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A JSON response containing an array of messages or an error message.
 *
 * @throws 500 - If there is an error fetching messages from the database.
 */


import { NextRequest, NextResponse } from "next/server";
import MessageModel from "../db/Message";

// This function handles the retrieval of the latest 100 messages
export async function GET(req: NextRequest) {
    try {
        const messages = await MessageModel.find().sort({ timestamp: 1 }).limit(100);
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching messages" }, { status: 500 });
    }
}
