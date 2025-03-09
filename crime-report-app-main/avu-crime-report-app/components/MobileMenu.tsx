import Link from 'next/link'

interface MobileMenuProps{
    isOpen:boolean;
    onClose: () => void;
}

export default function MobileMenu({isOpen, onClose}: MobileMenuProps){
    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 md:hidden">
            {/* backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            />
            {/* menu  content*/}
           
        </div>
    );
}