import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, redirect } from "react-router-dom";
import Footer from "../../../components/Footer";
import PatientHeader from "../../../components/PatientHeader";
import {
  fetchRecords,
  fetchResults,
} from "../../../store/features/fetchDataSlice";
import PatientRecordInfor from "../../system/clinic/PatientRecordInfor";
import PatientLabsTable from "./PatientLabsTable";
import PatientTableLabServices from "./PatientTableLabServices";
import ModalLabBooking from "./ModalLabBooking";
import RecordResults from "./result/RecordResults";
import ModalDetailResult from "./result/ModalDetailResult";
import { postRequestToast } from "../../../services/commonSv";
import PaymentTable from "./payment/PaymentTable";
import PatientMedicine from "./medicine/PatientMedicine";

export default function PatientDetailRecord() {
  const dispatch = useDispatch();
  const params = useParams();
  const { booking_id } = params;
  let navigate = useNavigate();

  // useState
  const { role, user } = useSelector((state) => state.user);
  const { records, results } = useSelector((state) => state.fetchData);
  const [selectedLab, setSelectedLab] = useState(null);
  const [openModalBooking, setOpenModalBooking] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // UseEffect
  useEffect(() => {
    dispatch(fetchRecords({ booking: booking_id }));
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (records && records.length > 0) {
      dispatch(fetchResults({ record: records[0]._id }));
    }
  }, [records]);

  useEffect(() => {
    if (openModalBooking || selectedResult) {
      document.querySelector("body").style.overflow = "hidden";
    } else {
      document.querySelector("body").style = "";
    }
  }, [openModalBooking, selectedResult]);

  // function
  function handleBookingLab(item) {
    if (records[0].payment) {
      setSelectedLab(item);
      setOpenModalBooking(true);
    } else {
      alert("Cần thanh toán chi phí dịch vụ trước khi đặt khám lâm sàng");
    }
  }

  function handleShowResult(item) {
    setSelectedResult(item);
  }

  async function handlePayment(totalCost) {
    let date = new Date();
    let res = await postRequestToast("/payment/create_payment_url", {
      amount: totalCost * 1000,
      orderDescription: "Thanh toan vien phi",
      orderId: records[0]._id,
    });
    if (res) {
      window.location.replace(res.url);
    }
  }

  return (
    <>
      <PatientHeader />
      {records && records.length > 0 ? (
        <>
          <div className="container mx-auto p-4 m-4 min-h-screen">
            <div className="flex flex-col gap-4 ">
              <PatientRecordInfor records={records} />

              {/* ------------------ kết quả kết luận của bác sĩ chuyên khoa --------------------- */}
              <div className="divider"></div>
              <div className="flex flex-col gap-4 p-4">
                <div className="w-full flex justify-center text-4xl m-4">
                  <span>Kết luận của bác sĩ chuyên khoa</span>
                </div>

                <div className=" shadow-2xl ">
                  {records && records[0].conclusionHtml && (
                    <div
                      className="prose lg:prose-xl p-4"
                      dangerouslySetInnerHTML={{
                        __html: records[0].conclusionHtml,
                      }}
                    ></div>
                  )}
                </div>
              </div>

              {/* ----------------- Thuốc  ====------------------------------ */}

              {records && (
                <PatientMedicine {...{ medicines: records[0].medicines }} />
              )}

              {/* ---------------- Kết quả khám lâm sàng ------------------ */}

              <RecordResults {...{ results, handleShowResult }} />
              {selectedResult && (
                <ModalDetailResult {...{ selectedResult, setSelectedResult }} />
              )}

              {/* --------------- Đăng ký lịch khám phòng khám lâm sàng------------------------ */}

              {records && (
                <PatientLabsTable {...{ records, handleBookingLab }} />
              )}

              {/* --------------------- Thanh toán -------------------- */}
              {records && (
                <PaymentTable
                  {...{
                    handlePayment,
                    record: records[0],
                    clinic: records[0].booking.clinic,
                    clinicService: records[0].booking.services[0],
                    labServices: records[0].labServices,
                  }}
                />
              )}

              <div></div>
              {/* --------------- dach sách dịch vụ Chỉ định khám lâm sàng------------------------ */}

              <PatientTableLabServices
                {...{
                  serviceList: _.sortBy(records[0].labServices, (o) => {
                    return o.service.lab.name;
                  }),
                }}
              />

              {/* -------------------------------------------------- */}
            </div>
          </div>

          {selectedLab && (
            <ModalLabBooking
              {...{
                openModalBooking,
                setOpenModalBooking,
                selectedLab,
                record: records[0],
                services: _.filter(records[0].labServices, (o) => {
                  return o.service.lab._id === selectedLab._id;
                }),
              }}
            />
          )}

          <Footer />
        </>
      ) : (
        <>Không tìm thấy hồ sơ bệnh nhân</>
      )}
    </>
  );
}
