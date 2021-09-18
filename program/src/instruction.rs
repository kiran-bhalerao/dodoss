use crate::{
    error::AppError,
    schema::dodo::{
        Dodo, CREATE_TIME_LEN, CREATOR_LEN, STATE_LEN, TAGLINE_LEN, TITLE_LEN, UPDATE_TIME_LEN,
    },
    utils::convert_u8bytes_to_string,
};
use arrayref::{array_ref, array_refs};
use solana_program::{program_error::ProgramError, program_pack::Pack};

#[derive(Clone, Debug, PartialEq)]
pub enum AppInstruction {
    CreateDodo {
        title: String,
        tagline: String,
        state: u8,
        create_time: u64,
        update_time: u64,
    },
    UpdateDodo {
        state: u8,
        update_time: u64,
    },
    RemoveDodo,
}

impl AppInstruction {
    pub fn unpack(instruction: &[u8]) -> Result<Self, ProgramError> {
        // first byte is to determine the instruction
        // get the first byte from instruction data
        let (&tag, rest) = instruction
            .split_first()
            .ok_or(AppError::InvalidInstruction)?;

        Ok(match tag {
            0 => {
                // decode binary data into Dodo schema

                let src = array_ref![rest, 0, Dodo::LEN - CREATOR_LEN]; // remove CREATOR_LEN, creator is not user input.
                let (_title, _tagline, _state, _create_time, _update_time) = array_refs![
                    src,
                    TITLE_LEN,
                    TAGLINE_LEN,
                    STATE_LEN,
                    CREATE_TIME_LEN,
                    UPDATE_TIME_LEN
                ];

                let title: String = convert_u8bytes_to_string(_title);
                let tagline: String = convert_u8bytes_to_string(_tagline);
                let state = u8::from_le_bytes(*_state);
                let create_time = u64::from_le_bytes(*_create_time);
                let update_time = u64::from_le_bytes(*_update_time);

                Self::CreateDodo {
                    title,
                    tagline,
                    state,
                    create_time,
                    update_time,
                }
            }
            1 => {
                let src = array_ref![rest, 0, STATE_LEN + UPDATE_TIME_LEN];
                let (_state, _update_time) = array_refs![src, STATE_LEN, UPDATE_TIME_LEN];

                let state = u8::from_le_bytes(*_state);
                let update_time = u64::from_le_bytes(*_update_time);

                Self::UpdateDodo { state, update_time }
            }
            2 => Self::RemoveDodo,
            _ => return Err(AppError::InvalidInstruction.into()),
        })
    }
}
