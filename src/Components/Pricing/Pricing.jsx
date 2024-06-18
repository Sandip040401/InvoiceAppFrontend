import React from 'react';
import Payment from '../Payment/Payment';

const Pricing = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center bg-primary text-white">
              Pricing Plans
            </div>
            <div className="card-body text-center">
              <p className="lead" style={{fontSize:"25px",fontWeight:'400'}}>Choose the best plan that suits your needs.</p>
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Basic Plan</h5>
                      <p className="card-text">Details about the Basic Plan.</p>
                      <p className="card-text"><strong>2000 / month</strong></p>
                        <Payment />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Premium Plan</h5>
                      <p className="card-text">Details about the Premium Plan.</p>
                      <p className="card-text"><strong>8000 / 6 months</strong></p>
                      <p className='card-text'>Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
