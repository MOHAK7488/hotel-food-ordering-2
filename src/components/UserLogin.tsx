import React, { useState } from 'react';
import { Phone, Shield, ArrowLeft, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface UserLoginProps {
  onLogin: (mobile: string) => void;
  onBack: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin, onBack }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate OTP (in production, this would be sent via SMS)
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setStep('otp');
    setIsLoading(false);

    // Show OTP in console for demo purposes
    console.log(`OTP for ${mobile}: ${newOtp}`);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp === generatedOtp || otp === '123456') { // Demo OTP: 123456
      onLogin(mobile);
    } else {
      setError('Invalid OTP. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtp('');
    setError('');
    setIsLoading(false);
    
    console.log(`New OTP for ${mobile}: ${newOtp}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center mb-8 mt-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {step === 'mobile' ? 'Login with Mobile' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 'mobile' 
              ? 'Enter your mobile number to receive OTP' 
              : `OTP sent to +91 ${mobile}`
            }
          </p>
        </div>

        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setMobile(value);
                      setError('');
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                    setError('');
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Demo Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Demo Application - OTP Information
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Why OTP isn't sent via SMS:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>This is a demo application for portfolio showcase</li>
                  <li>Real SMS integration requires paid SMS gateway services</li>
                  <li>Production apps use services like Twilio, AWS SNS, or local SMS providers</li>
                  <li>For security, real OTPs expire in 5-10 minutes</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                  <p className="font-semibold">Demo OTP: <span className="text-blue-600">123456</span></p>
                  <p className="text-xs">Generated OTP: <span className="font-mono">{generatedOtp}</span></p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-300"
            >
              Didn't receive OTP? Resend
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserLogin;