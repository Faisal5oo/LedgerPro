import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import { Notification } from '../../../../models/Submission';

// DELETE endpoint to delete a notification
export async function DELETE(req, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    
    // Find and delete the notification
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Notification deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 