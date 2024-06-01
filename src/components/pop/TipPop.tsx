

import Modal from 'antd/es/modal'
import { failIcon, loadingIcon, successIcon } from '../../image'
interface OpenStatus {
    open: boolean,
    setOpen: Function,
    tipPopText: string,
    tipPopState: string
}

export default function TipPop({ open, setOpen, tipPopText, tipPopState }: OpenStatus) {

    return <Modal zIndex={2000} open={open}
        style={{
            marginTop: "20%",
        }}
        className='TipPop'
        closeIcon={null}
        width={"200px"}
        footer={null}
    >
        <div >
            {
                tipPopState == "loading" && <img style={{
                    margin: "0 auto"
                }} className=' w-8 h-8 animate-spin' src={loadingIcon} alt="" />
            }

            {
                tipPopState == "success" && <img style={{
                    margin: "0 auto"
                }} className=' w-8 h-8' src={successIcon} alt="" />
            }

            {
                tipPopState == "error" && <img style={{
                    margin: "0 auto"
                }} className=' w-8 h-8' src={failIcon} alt="" />
            }
        </div>
        <div>
            <p className='break-words text-sm text-center text-black mt-2'>{tipPopText}  </p>
        </div>
    </Modal>

}