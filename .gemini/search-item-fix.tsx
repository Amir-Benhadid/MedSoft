<CommandItem
    key={patient.id}
    value={`${patient.surname} ${patient.name} ${patient.id}`}
    onSelect={() => handlePatientClick(patient)}
    className="flex items-center justify-between p-3 cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-900 data-[disabled]:pointer-events-auto data-[disabled]:opacity-100 antialiased"
    style={{ opacity: 1 }}
>
    <div className="flex items-center gap-3">
        <div>
            <div className="font-extrabold text-slate-900 capitalize text-base">
                {patient.surname} {patient.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                {patient.dob && (
                    <span>Né(e) en {patient.dob}</span>
                )}
                {patient.city && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {patient.city}
                    </span>
                )}
            </div>
        </div>
    </div>
    {patient.phone_number && (
        <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
            <Phone className="w-3 h-3" />
            {patient.phone_number}
        </div>
    )}
</CommandItem>
