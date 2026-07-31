"use client";

import React, { useState } from 'react';
import { OfficialPriceCard, OfficialApp } from '@/components/OfficialPriceCard';

interface Props {
  apps: OfficialApp[];
}

export default function OfficialPricesClient({ apps }: Props) {
  // If there are many apps in the future, we could add search or filters here.
  // For now, we simply display them in a responsive grid.

  if (!apps || apps.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        暂无官方订阅价格数据
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map(app => (
        <OfficialPriceCard key={app.id} app={app} />
      ))}
    </div>
  );
}
