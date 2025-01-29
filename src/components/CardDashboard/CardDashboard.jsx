import React from "react";

const CardDaschboard = ({ 
  message, 
  icon, 
  borderColor, 
  amount, 
  showProgress, 
  progressValue, 
  progressColor 
}) => {
  return (
    <div className="col-xl-3 col-md-6 mb-4">
      <div
        className="card shadow h-100 py-2"
        style={{ borderLeft: `3px solid ${borderColor}` }}
      >
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col">
              <div className="text-uppercase fw-bold small mb-1" style={{ color: borderColor }}>
                {message}
              </div>
              {showProgress ? (
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className="h5 mb-0 me-3 fw-bold text-dark">{progressValue}%</div>
                  </div>
                  <div className="col">
                    <div className="progress progress-sm">
                      <div
                        className={`progress-bar`}
                        role="progressbar"
                        style={{ width: `${progressValue}%`, backgroundColor: progressColor }}
                        aria-valuenow={progressValue}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h5 mb-0 fw-bold text-dark">{amount}</div>
              )}
            </div>
            <div className="col-auto">
              <i className={`fa ${icon} fa-2x text-secondary`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDaschboard;
