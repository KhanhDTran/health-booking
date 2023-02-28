import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../../components/AdminHeader";
import Err401Page from "../../../../components/Err401Page";
import { customStyles } from "../../../../utils/CommonUtils";
import Select from "react-select";
import _ from "lodash";
import { putRequestToast } from "../../../../services/commonSv";
import { convertToSelectOptions } from "../../../../utils/CommonUtils";
import {
  fetchAllClinics,
  fetchAllLabs,
  fetchScedules,
} from "../../../../store/features/fetchDataSlice";
import {
  timeListAm,
  timeListPM,
  timeListNight,
} from "../../../../utils/CommonUtils";
import DatePicker from "react-datepicker";
import TimeListButton from "./TimeListButton";

export default function ManageSchedule() {
  const dispatch = useDispatch();

  const { role } = useSelector((state) => state.user);
  const { clinics, labs, schedules } = useSelector((state) => state.fetchData);

  const [date, setDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [choose, setChoose] = useState(false);

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicOptions, setclinicOptions] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labOptions, setlabOptions] = useState([]);

  const [checkAm, setCheckAm] = useState(false);
  const [checkPm, setCheckPm] = useState(false);
  const [checkninght, setCheckNinght] = useState(false);

  console.log(schedules);

  useEffect(() => {
    dispatch(fetchAllClinics());
    dispatch(fetchAllLabs());
    setAllListAttibute("date", date);
  }, []);

  useEffect(() => {
    if (!_.isEmpty(clinics)) setclinicOptions(convertToSelectOptions(clinics));
    if (!_.isEmpty(labs)) setlabOptions(convertToSelectOptions(labs));
  }, [clinics, labs]);

  useEffect(() => {
    if (!selectedClinic && !selectedLab) {
      setAllListAttibute("lab", null);
      setAllListAttibute("clinic", null);
    }
    clearAll();

    if (selectedClinic) {
      dispatch(fetchScedules({ clinic: selectedClinic._id, date }));
      setAllListAttibute("clinic", selectedClinic._id);
      setOnAfterFetch();
    }
    if (selectedLab) {
      dispatch(fetchScedules({ lab: selectedLab._id, date }));
      setAllListAttibute("lab", selectedLab._id);
      setOnAfterFetch();
    }
  }, [selectedClinic, selectedLab]);

  async function handleSaveSchedule() {
    await putRequestToast(
      "/upsert-schedule",
      {
        clinic: selectedClinic ? selectedClinic._id : null,
        lab: selectedLab ? selectedLab._id : null,
        date,
        list: getAllTimeOn(),
      },
      "Đang lưu thay đổi thời gian biểu...."
    );
  }

  function getAllTimeOn() {
    let list = [];
    _.forEach(timeListAm, (o) => {
      if (o.isOn) list.push(o);
    });
    _.forEach(timeListPM, (o) => {
      if (o.isOn) list.push(o);
    });
    _.forEach(timeListNight, (o) => {
      if (o.isOn) list.push(o);
    });
    return list;
  }

  function setOnAfterFetch() {
    clearAll();
    setListOnAFterFetch(timeListAm);
    setListOnAFterFetch(timeListPM);
    setListOnAFterFetch(timeListNight);
    setChoose(!choose);
  }

  console.log();

  function setListOnAFterFetch(list) {
    _.forEach(list, function (obj) {
      if (_.find(schedules, { hour: obj.hour })) {
        _.set(obj, "isOn", true);
      }
    });
  }

  function handleChangeDate(e) {
    setDate(e);
    setAllListAttibute("date", e);
    clearAll();
    if (selectedClinic) {
      dispatch(fetchScedules({ clinic: selectedClinic._id, date: e }));
      setOnAfterFetch();
    }
    if (selectedLab) {
      dispatch(fetchScedules({ lab: selectedLab._id, date: e }));
      setOnAfterFetch();
    }
  }

  function setAllListAttibute(attribute, value) {
    setArray(timeListAm, attribute, value);
    setArray(timeListPM, attribute, value);
    setArray(timeListNight, attribute, value);
  }

  function clearAll() {
    clearOnTimeList(timeListAm);
    clearOnTimeList(timeListNight);
    clearOnTimeList(timeListPM);
    setCheckAm(false);
    setCheckPm(false);
    setCheckNinght(false);
  }

  function setArray(list, atribute, value) {
    _.forEach(list, function (obj) {
      _.set(obj, atribute, value);
    });
  }

  function setOnTimeList(list) {
    setArray(list, "isOn", true);
  }

  function clearOnTimeList(list) {
    setArray(list, "isOn", false);
  }

  return (
    <>
      <div>
        {role && role === "admin" ? (
          <>
            <AdminHeader />
            <div className="container mx-auto flex flex-col">
              <div className="title text-md lg:text-3xl p-4 m-4 bg-base-300 rounded-box text-center">
                <span className="">Thời Gian Biểu </span>{" "}
              </div>
              <div className="select-lab-clinic flex flex-col lg:flex-row">
                {/* Select clinic */}
                <div className="container mx-auto flex justify-center m-4">
                  <div className="w-64 lg:w-96 ">
                    <label htmlFor="">Phòng khám chuyên khoa</label>
                    <Select
                      isClearable={true}
                      className="my-react-select-container"
                      classNamePrefix="my-react-select"
                      options={clinicOptions}
                      isDisabled={selectedLab ? true : false}
                      styles={customStyles}
                      placeholder={"Phòng chuyên khoa....."}
                      onChange={(e) => {
                        if (e) {
                          setSelectedClinic(_.find(clinics, { _id: e.value }));
                        } else {
                          setSelectedClinic(null);
                        }
                      }}
                    />{" "}
                  </div>
                </div>
                {/* Select clinic */}
                {/* Select lab */}
                <div className="container mx-auto flex justify-center m-4 w-50">
                  <div className="w-64 lg:w-96 ">
                    <label htmlFor="">Phòng khám lâm sàng</label>
                    <Select
                      isClearable={true}
                      isDisabled={selectedClinic ? true : false}
                      className="my-react-select-container"
                      classNamePrefix="my-react-select"
                      options={labOptions}
                      styles={customStyles}
                      placeholder={"Phòng lâm sàng....."}
                      onChange={(e) => {
                        if (e) {
                          setSelectedLab(_.find(labs, { _id: e.value }));
                        } else {
                          setSelectedLab(null);
                        }
                      }}
                    />{" "}
                  </div>
                </div>
                {/* Select lab */}
              </div>
              <div className="divider"></div>

              <div className="flex flex-col container mx-auto justify-center gap-10 pb-10">
                <div className="container mx-auto flex flex-col lg:flex-row justify-center">
                  <div className="p-4 w-96 flex flex-col  gap-4 justify-center">
                    <label
                      htmlFor="date"
                      className="text-2xl w-40 hover:cursor-pointer"
                    >
                      Chọn ngày <i className="fa-solid fa-calendar"></i>
                    </label>

                    <DatePicker
                      id="date"
                      startDate={new Date(new Date().setHours(0, 0, 0, 0))}
                      minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                      selected={date}
                      onChange={(e) => handleChangeDate(e)}
                      dateFormat="dd - MM - yyyy"
                    />
                  </div>
                  <div className="pt-10 pl-10 ">
                    <button
                      className="btn btn-info w-40 text-white"
                      disabled={!selectedClinic && !selectedLab ? true : false}
                      onClick={handleSaveSchedule}
                    >
                      Lưu
                    </button>
                  </div>
                </div>

                <TimeListButton
                  {...{
                    dayninght: "Buổi Sáng",
                    clearOnTimeList,
                    check: checkAm,
                    setCheck: setCheckAm,
                    timeList: timeListAm,
                    choose,
                    setChoose,
                    setOnTimeList,
                    clearOnTimeList,
                    selectedClinic,
                    selectedLab,
                  }}
                />
                <TimeListButton
                  {...{
                    dayninght: "Buổi Chiều",
                    clearOnTimeList,
                    check: checkPm,
                    setCheck: setCheckPm,
                    timeList: timeListPM,
                    choose,
                    setChoose,
                    setOnTimeList,
                    clearOnTimeList,
                    selectedClinic,
                    selectedLab,
                  }}
                />
                <TimeListButton
                  {...{
                    dayninght: "Buổi Tối",
                    clearOnTimeList,
                    check: checkninght,
                    setCheck: setCheckNinght,
                    timeList: timeListNight,
                    choose,
                    setChoose,
                    setOnTimeList,
                    clearOnTimeList,
                    selectedClinic,
                    selectedLab,
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <Err401Page />
        )}
      </div>
    </>
  );
}
