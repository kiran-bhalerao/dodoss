use std::str::from_utf8;

use crate::error::AppError;
use arrayref::{array_ref, array_refs};
use solana_program::program_error::ProgramError;

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

                let src = array_ref![rest, 0, 124 * 4 + 24 * 4 + 1 + 8 + 8];
                let (_title, _tagline, _state, _create_time, _update_time) =
                    array_refs![src, 124 * 4, 24 * 4, 1, 8, 8];

                let title: String = _title
                    .chunks(4)
                    .map(|slice| {
                        let end = if slice[3] > 0 {
                            3
                        } else if slice[2] > 0 {
                            2
                        } else if slice[1] > 0 {
                            1
                        } else {
                            0
                        };

                        from_utf8(&slice[0..=end]).unwrap().to_string()
                    })
                    .collect();

                let tagline: String = _tagline
                    .chunks(4)
                    .map(|slice| {
                        let end = if slice[3] > 0 {
                            3
                        } else if slice[2] > 0 {
                            2
                        } else if slice[1] > 0 {
                            1
                        } else {
                            0
                        };

                        from_utf8(&slice[0..=end]).unwrap().to_string()
                    })
                    .collect();

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
                let src = array_ref![rest, 0, 1 + 8];
                let (_state, _update_time) = array_refs![src, 1, 8];

                let state = u8::from_le_bytes(*_state);
                let update_time = u64::from_le_bytes(*_update_time);

                Self::UpdateDodo { state, update_time }
            }
            2 => Self::RemoveDodo,
            _ => return Err(AppError::InvalidInstruction.into()),
        })
    }
}
