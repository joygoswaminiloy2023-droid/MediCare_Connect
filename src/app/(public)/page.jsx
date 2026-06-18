import Banner from '@/components/home/Banner';
import FeaturedDoctors from '@/components/home/FeaturedDoctors';
import PlatformStats from '@/components/home/PlatformStats';
import Specializations from '@/components/home/Specializations';
import SuccessStories from '@/components/home/SuccessStories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import React from 'react';

const page = () => {
    return (
        <div className='space-y-5'>
            <Banner></Banner>
                <FeaturedDoctors></FeaturedDoctors>
            <Specializations></Specializations>
        <PlatformStats></PlatformStats>
        <SuccessStories></SuccessStories>
        <WhyChooseUs></WhyChooseUs>

        </div>
    );
};

export default page;