// src/app/api/user.js
export const registerUser  = async (userData) => {
    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response.json();
};

// src/app/api/payment.js
export const createPaymentIntent = async (amount) => {
    const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
    });
    return response.json();
};
