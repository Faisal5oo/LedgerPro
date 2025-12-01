import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';
import { adminProtectedRoute } from '@/middleware/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch a single customer by ID
export async function GET(req, { params }) {
  try {
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(id).lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT - Update a customer
export async function PUT(req, { params }) {
  try {
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { id } = params;
    const body = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Check if another customer with same name already exists
    const existingCustomer = await Customer.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this name already exists' },
        { status: 409 }
      );
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        name: body.name.trim(),
        description: body.description?.trim() || '',
        address: body.address?.trim() || '',
        phone: body.phone?.trim() || ''
      },
      { new: true, runValidators: true }
    ).lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a customer
export async function DELETE(req, { params }) {
  try {
    const authError = await adminProtectedRoute(req);
    if (authError) return authError;

    await dbConnect();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

