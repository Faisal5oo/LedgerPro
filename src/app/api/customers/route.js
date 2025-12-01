import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';
import { adminProtectedRoute } from '@/middleware/authMiddleware';

// GET - Fetch all customers
export async function GET(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    
    const customers = await Customer.find({})
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(req) {
  try {
    // Check admin authorization
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const body = await req.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Check if customer with same name already exists
    const existingCustomer = await Customer.findOne({ 
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this name already exists' },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      name: body.name.trim(),
      description: body.description?.trim() || '',
      address: body.address?.trim() || '',
      phone: body.phone?.trim() || ''
    });
    
    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
