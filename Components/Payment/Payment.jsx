import React from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

const Payment = ({ setSubscriptionStatus }) => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const backendUrl = import.meta.env.VITE_BASE_URL;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed with the payment.');
      loginWithRedirect();
      return;
    }

    const { data: order } = await axios.post(`${backendUrl}/api/payment/create-order`, {
      amount: 500, // Example amount
      currency: 'INR',
      receipt: 'receipt#1',
      plan: 'monthly',
      userEmail: user.email
    });

    const options = {
      key: 'rzp_test_1WEsbofwCAiJAg',
      amount: order.amount,
      currency: order.currency,
      name: 'Dear Invoice',
      description: 'Subscription Plan',
      order_id: order.id,
      handler: async (response) => {
        const paymentData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          userEmail: user.email
        };

        const result = await axios.post(`${backendUrl}/api/payment/verify-payment`, paymentData);
        if (result.data.status === 'success') {
          alert('Payment Successful');
          // Update the subscription status
          setSubscriptionStatus('active');
        } else {
          alert('Payment Failed');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: '9999999999' // Add a default or fetch from user profile
      },
      theme: {
        color: '#F37254'
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    // <div className="container mt-5">
    //   <div className="row justify-content-center">
    //     <div className="col-md-8">
    //       <div className="card">
    //         <div className="card-header text-center bg-primary text-white">
    //           Subscribe to Access Premium Features
    //         </div>
    //         <div className="card-body text-center">
    //           <p>Get access to premium features by subscribing to our plan.</p>
              <button onClick={handlePayment} className="btn btn-success">
                Pay Now
              </button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Payment;
