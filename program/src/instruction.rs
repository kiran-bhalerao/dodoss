use std::convert::TryInto;

use crate::{error::AppError, schema::dodo::Dodo};
use solana_program::{program_error::ProgramError, program_pack::Pack};

#[derive(Clone, Debug, PartialEq)]
pub enum AppInstruction {
    CreateDodo {
        title: String,
        content: String,
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
                // unpack binary data into Memo schema
                let Dodo {
                    title,
                    content,
                    state,
                    create_time,
                    update_time,
                } = Dodo::unpack(rest)?;

                Self::CreateDodo {
                    title,
                    content,
                    state,
                    create_time,
                    update_time,
                }
            }
            1 => {
                let Dodo {
                    state, update_time, ..
                } = Dodo::unpack(rest)?;

                Self::UpdateDodo { state, update_time }
            }
            2 => Self::RemoveDodo,
            _ => return Err(AppError::InvalidInstruction.into()),
        })
    }
}
