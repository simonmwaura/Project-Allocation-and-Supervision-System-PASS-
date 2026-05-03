const BRAND = "#302AE2";

const SupervisorContact = ({ supervisorData }) => {
  return (
    <div
      className="bg-white p-8 rounded-2xl shadow-sm border-2 flex flex-col space-y-5"
      style={{ borderColor: BRAND }}
    >
      <h3 className="text-xl font-bold" style={{ color: BRAND }}>
        My Supervisor
      </h3>

      <div className="flex flex-col space-y-4 text-sm w-full">

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500 w-16 shrink-0">Name:</span>
          <span className="font-bold text-gray-800 text-base">{supervisorData.name}</span>
        </div>

        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-semibold text-gray-500 w-16 shrink-0">Email:</span>
          <span
            className="font-medium truncate"
            style={{ color: BRAND }}
            title={supervisorData.email}
          >
            {supervisorData.email}
          </span>
        </div>

      </div>
    </div>
  );
};

export default SupervisorContact;