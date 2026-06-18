import Banner from '@/components/home/Banner';
import FeaturedDoctors from '@/components/home/FeaturedDoctors';
import Specializations from '@/components/home/Specializations';
import React from 'react';

const page = () => {
    return (
        <div className='space-y-5'>
            <Banner></Banner>
                <FeaturedDoctors></FeaturedDoctors>
            <Specializations></Specializations>
        

        </div>
    );
};

export default page;