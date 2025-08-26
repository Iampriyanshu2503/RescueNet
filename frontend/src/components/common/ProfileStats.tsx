import React from 'react';
import { User } from '../../types/auth';
import { Award, Calendar, Heart, Package, Star, TrendingUp, Users } from 'lucide-react';

interface ProfileStatsProps {
  user: User | null;
  stats: {
    totalDonations?: number;
    mealsServed?: number;
    successfulPickups?: number;
    monthsActive?: number;
    impactRating?: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user, stats }) => {
  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Impact Statistics</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user.role === 'donor' && stats.totalDonations !== undefined && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{stats.totalDonations}</div>
              <div className="text-sm text-blue-600">Total Donations</div>
            </div>
          )}
          
          {user.role === 'donor' && stats.mealsServed !== undefined && (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.mealsServed}</div>
              <div className="text-sm text-green-600">Meals Served</div>
            </div>
          )}
          
          {user.role === 'recipient' && stats.successfulPickups !== undefined && (
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">{stats.successfulPickups}</div>
              <div className="text-sm text-amber-600">Successful Pickups</div>
            </div>
          )}
          
          {stats.monthsActive !== undefined && (
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{stats.monthsActive}</div>
              <div className="text-sm text-purple-600">Months Active</div>
            </div>
          )}
          
          {stats.impactRating !== undefined && (
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{stats.impactRating.toFixed(1)}</div>
              <div className="text-sm text-orange-600">Impact Rating</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;