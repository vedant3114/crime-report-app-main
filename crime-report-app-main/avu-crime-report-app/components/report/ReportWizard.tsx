'use client'
import { use, useState } from 'react';
import { ReportForm } from './ReportForm';
//report form
//report submitted
 export function ReportWizard(){
    const [currentstep,setCurrentStep] =useState(1);
    const [reportData ,setReportData] = useState<any>(null);

    const handleStepComplete =async (data:any) => {
        setReportData({...reportData, ...data});

        if(currentstep === 3){
            return;
        }
        setCurrentStep((prev) => prev +1);

    };

    return (<div className='rounded-2xl bg-zinc-900 p-8'>
            {currentstep ===1 && <ReportForm onComplete={handleStepComplete}/>}
        </div>
    );
    
 }