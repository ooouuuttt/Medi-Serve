import type { Order } from './types';

export const orders: Order[] = [
    {
        id: "order1",
        customerName: "Amogha Khare",
        createdAt: "2024-07-28T12:00:00.000Z",
        items: [
            {
                medicine: {
                    id: "Dh5orYf4ooaWSDKVCdWP",
                    name: "dollo 650",
                    price: 6,
                },
                quantity: 3,
            }
        ],
        total: 18,
        status: 'Pending'
    },
    {
        id: "order2",
        customerName: "Jane Smith",
        createdAt: "2024-07-27T10:30:00.000Z",
        items: [
            {
                medicine: {
                    id: "med2",
                    name: "Ibuprofen",
                    price: 8.50,
                },
                quantity: 2,
            }
        ],
        total: 17,
        status: 'Processing'
    },
    {
        id: "order3",
        customerName: "John Doe",
        createdAt: "2024-07-26T15:45:00.000Z",
        items: [
            {
                medicine: {
                    id: "med7",
                    name: "Cetirizine",
                    price: 7.80,
                },
                quantity: 1,
            },
            {
                medicine: {
                    id: "med1",
                    name: "Paracetamol",
                    price: 5.00,
                },
                quantity: 2,
            }
        ],
        total: 17.80,
        status: 'Ready for Pickup'
    }
];
