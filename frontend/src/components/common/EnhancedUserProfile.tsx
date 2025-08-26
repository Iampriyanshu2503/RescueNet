import React from 'react';
import { User } from '../../types/auth';
import { MapPin, Mail, Phone, Calendar, Award, Shield, Star } from 'lucide-react';

interface EnhancedUserProfileProps {
  user: User;
  stats?: {
    totalDonations?: number;
    mealsServed?: number;
    successfulPickups?: number;
    impactScore?: number;
    memberSince?: string;
    rating?: number;
  };
}

const EnhancedUserProfile: React.FC<EnhancedUserProfileProps> = ({ user, stats }) => {
  const getBadgeByRole = (role: string) => {
    switch (role) {
      case 'donor':
        return (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Food Donor
          </div>
        );
      case 'recipient':
        return (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Food Recipient
          </div>
        );
      case 'volunteer':
        return (
          <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            Volunteer
          </div>
        );
      default:
        return null;
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              {getBadgeByRole(user.role)}
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </div>
            {user.location && user.location.address && (
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-2" />
                {user.location.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-6 border-t border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.totalDonations !== undefined && user.role === 'donor' && (
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.totalDonations}</div>
                <div className="text-sm text-blue-600">Total Donations</div>
              </div>
            )}
            
            {stats.mealsServed !== undefined && user.role === 'donor' && (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.mealsServed}</div>
                <div className="text-sm text-green-600">Meals Served</div>
              </div>
            )}
            
            {stats.successfulPickups !== undefined && user.role === 'recipient' && (
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{stats.successfulPickups}</div>
                <div className="text-sm text-amber-600">Successful Pickups</div>
              </div>
            )}
            
            {stats.impactScore !== undefined && (
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">{stats.impactScore}</div>
                <div className="text-sm text-purple-600">Impact Score</div>
              </div>
            )}
            
            {stats.rating !== undefined && (
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center text-2xl font-bold text-yellow-700">
                  {stats.rating} <Star className="w-4 h-4 ml-1 fill-current" />
                </div>
                <div className="text-sm text-yellow-600">Rating</div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm font-medium text-gray-700">Member Since</div>
              <div className="text-base text-gray-900">{memberSince}</div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info Based on Role */}
      <div className="p-6 border-t border-gray-200/50">
        {user.role === 'donor' && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-700" />
              Donor Verification
            </h4>
            <p className="text-blue-800 text-sm">
              Your account is verified as a food donor. You can create food listings and manage your donations.
            </p>
          </div>
        )}
        
        {user.role === 'recipient' && (
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-700" />
              Recipient Verification
            </h4>
            <p className="text-green-800 text-sm">
              Your account is verified as a food recipient. You can browse and request available food donations.
            </p>
          </div>
        )}
        
        {user.role === 'volunteer' && (
          <div className="bg-purple-50 rounded-xl p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-700" />
              Volunteer Verification
            </h4>
            <p className="text-purple-800 text-sm">
              Your account is verified as a volunteer. You can help coordinate food pickups and deliveries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedUserProfile;